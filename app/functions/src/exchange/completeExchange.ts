import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FieldValue, getFirestore, Timestamp} from "firebase-admin/firestore";
import {
  COLLECTIONS,
  characterIdFromEggId,
  EggDoc,
  ExchangeDoc,
  FirestoreTimestamp,
  UserDoc,
} from "../types/firestore";

export interface CompleteExchangeInput {
  exchangeId: string;
}

export interface CompleteExchangeOutput {
  exchangeId: string;
  characterId: string;
  eggId: string;
}

const URL_CLAIMS_SUBCOLLECTION = "claims";

export interface CompleteExchangeTx {
  getExchange: (id: string) => Promise<ExchangeDoc | null>;
  getEgg: (id: string) => Promise<EggDoc | null>;
  updateExchange: (id: string, partial: Partial<ExchangeDoc>) => void;
  updateEgg: (id: string, partial: Partial<EggDoc>) => void;
}

export interface CompleteExchangeDeps {
  runTransaction: <T>(fn: (tx: CompleteExchangeTx) => Promise<T>) => Promise<T>;
  getUser: (uid: string) => Promise<UserDoc | null>;
  now: () => Date;
}

/**
 * Normalise a DateLike value to epoch milliseconds.
 * @param {*} value DateLike value (Timestamp or ISO).
 * @return {number} Epoch milliseconds.
 */
function toMillis(value: ExchangeDoc["expiresAt"]): number {
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return (value as FirestoreTimestamp).toMillis();
}

/**
 * Pure handler for completeExchange (testable via injected deps).
 * @param {string|undefined} callerUid Authenticated user uid.
 * @param {object} input Callable input data containing exchangeId.
 * @param {CompleteExchangeDeps} deps Injected I/O dependencies.
 * @return {Promise<CompleteExchangeOutput>} The completed exchange ids.
 */
export async function completeExchangeHandler(
  callerUid: string | undefined,
  input: { exchangeId?: unknown },
  deps: CompleteExchangeDeps,
): Promise<CompleteExchangeOutput> {
  if (!callerUid) {
    throw new HttpsError("unauthenticated", "ログインが必要です");
  }

  const exchangeId = input?.exchangeId;
  if (typeof exchangeId !== "string" || exchangeId.length === 0) {
    throw new HttpsError("invalid-argument", "exchangeId が必要です");
  }

  const user = await deps.getUser(callerUid);
  const toUserName = user?.name ?? "";
  const now = deps.now();

  return deps.runTransaction(async (tx) => {
    const exchange = await tx.getExchange(exchangeId);
    if (!exchange) {
      throw new HttpsError("not-found", "交換リンクが見つかりません");
    }

    if (!exchange.status || !exchange.shareMethod) {
      throw new HttpsError("internal", "交換ドキュメントの形式が不正です");
    }

    if (exchange.status !== "pending") {
      throw new HttpsError(
        "failed-precondition",
        "この卵はすでに受け取られています",
      );
    }

    if (toMillis(exchange.expiresAt) <= now.getTime()) {
      throw new HttpsError(
        "deadline-exceeded",
        "この交換リンクは期限切れです",
      );
    }

    if (exchange.fromUid === callerUid) {
      throw new HttpsError(
        "permission-denied",
        "自分が共有した卵は受け取れません",
      );
    }

    const egg = await tx.getEgg(exchange.eggId);
    if (!egg) {
      throw new HttpsError("internal", "対象の卵が見つかりません");
    }

    tx.updateEgg(exchange.eggId, {currentOwnerUid: callerUid});
    tx.updateExchange(exchangeId, {
      status: "completed",
      toUid: callerUid,
      toUserName,
      completedAt: Timestamp.fromDate(now),
    });

    return {
      exchangeId,
      characterId: characterIdFromEggId(exchange.eggId),
      eggId: exchange.eggId,
    };
  });
}

export const completeExchange = onCall<CompleteExchangeInput>(
  {region: "asia-northeast1"},
  async (request) => {
    const db = getFirestore();

    // URL 共有は「複製配布」モデル:
    // 受け取るたびに受信者向けの新しい egg を発行し、元 egg は保持する。
    const exchangeId = request.data?.exchangeId;
    if (typeof exchangeId !== "string" || exchangeId.length === 0) {
      throw new HttpsError("invalid-argument", "exchangeId が必要です");
    }
    const callerUid = request.auth?.uid;
    if (!callerUid) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    const exchangeRef = db.collection(COLLECTIONS.EXCHANGES).doc(exchangeId);
    const exchangeSnap = await exchangeRef.get();
    if (!exchangeSnap.exists) {
      throw new HttpsError("not-found", "交換リンクが見つかりません");
    }
    const exchange = exchangeSnap.data() as ExchangeDoc;

    if (exchange.shareMethod === "url") {
      const now = new Date();
      if (toMillis(exchange.expiresAt) <= now.getTime()) {
        throw new HttpsError(
          "deadline-exceeded",
          "この交換リンクは期限切れです",
        );
      }
      if (exchange.fromUid === callerUid) {
        throw new HttpsError(
          "permission-denied",
          "自分が共有した卵は受け取れません",
        );
      }

      const sourceEggRef = db.collection(COLLECTIONS.EGGS).doc(exchange.eggId);
      const claimRef = exchangeRef
        .collection(URL_CLAIMS_SUBCOLLECTION)
        .doc(callerUid);
      const receivedEggRef = db.collection(COLLECTIONS.EGGS).doc();
      const receivedEggId = receivedEggRef.id;

      await db.runTransaction(async (txn) => {
        const [claimSnap, sourceEggSnap] = await Promise.all([
          txn.get(claimRef),
          txn.get(sourceEggRef),
        ]);

        if (claimSnap.exists) {
          throw new HttpsError(
            "failed-precondition",
            "このリンクはすでに受け取り済みです",
          );
        }
        if (!sourceEggSnap.exists) {
          throw new HttpsError("internal", "対象の卵が見つかりません");
        }

        const sourceEgg = sourceEggSnap.data() as EggDoc;
        txn.set(receivedEggRef, {
          ...sourceEgg,
          currentOwnerUid: callerUid,
          hatched: false,
          createdAt: FieldValue.serverTimestamp(),
        });
        txn.set(claimRef, {
          uid: callerUid,
          claimedAt: FieldValue.serverTimestamp(),
          receivedEggId,
        });
      });

      return {
        exchangeId,
        characterId: characterIdFromEggId(receivedEggId),
        eggId: receivedEggId,
      };
    }

    return completeExchangeHandler(request.auth?.uid, request.data, {
      runTransaction: (fn) =>
        db.runTransaction(async (txn) => {
          const tx: CompleteExchangeTx = {
            getExchange: async (id) => {
              const ref = db.collection(COLLECTIONS.EXCHANGES).doc(id);
              const snap = await txn.get(ref);
              return snap.exists ? (snap.data() as ExchangeDoc) : null;
            },
            getEgg: async (id) => {
              const ref = db.collection(COLLECTIONS.EGGS).doc(id);
              const snap = await txn.get(ref);
              return snap.exists ? (snap.data() as EggDoc) : null;
            },
            updateExchange: (id, partial) => {
              const ref = db.collection(COLLECTIONS.EXCHANGES).doc(id);
              txn.update(ref, partial);
            },
            updateEgg: (id, partial) => {
              const ref = db.collection(COLLECTIONS.EGGS).doc(id);
              txn.update(ref, partial);
            },
          };
          return fn(tx);
        }),
      getUser: async (uid) => {
        const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
        return snap.exists ? (snap.data() as UserDoc) : null;
      },
      now: () => new Date(),
    });
  },
);
