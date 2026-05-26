import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {randomUUID} from "node:crypto";
import {
  COLLECTIONS,
  EggDoc,
  ExchangeDoc,
  UserDoc,
} from "../types/firestore";

const URL_EXCHANGE_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface CreateUrlExchangeInput {
  eggId: string;
}

export interface CreateUrlExchangeOutput {
  exchangeId: string;
}

export interface CreateUrlExchangeDeps {
  getEgg: (eggId: string) => Promise<EggDoc | null>;
  getUser: (uid: string) => Promise<UserDoc | null>;
  setExchange: (id: string, doc: ExchangeDoc) => Promise<void>;
  now: () => Date;
  generateId: () => string;
}

/**
 * Pure handler for createUrlExchange (testable via injected deps).
 * @param {string|undefined} callerUid Authenticated user uid.
 * @param {object} input Callable input data containing eggId.
 * @param {CreateUrlExchangeDeps} deps Injected I/O dependencies.
 * @return {Promise<CreateUrlExchangeOutput>} The newly created exchange id.
 */
export async function createUrlExchangeHandler(
  callerUid: string | undefined,
  input: { eggId?: unknown },
  deps: CreateUrlExchangeDeps,
): Promise<CreateUrlExchangeOutput> {
  if (!callerUid) {
    throw new HttpsError("unauthenticated", "ログインが必要です");
  }

  const eggId = input?.eggId;
  if (typeof eggId !== "string" || eggId.length === 0) {
    throw new HttpsError("invalid-argument", "eggId が必要です");
  }

  const egg = await deps.getEgg(eggId);
  if (!egg) {
    throw new HttpsError("not-found", "卵が見つかりません");
  }

  if (egg.currentOwnerUid !== callerUid) {
    throw new HttpsError(
      "permission-denied",
      "自分が所有する卵のみ共有できます",
    );
  }

  const user = await deps.getUser(callerUid);
  const fromUserName = user?.name ?? "";

  const exchangeId = deps.generateId();
  const now = deps.now();
  const expiresAt = Timestamp.fromDate(
    new Date(now.getTime() + URL_EXCHANGE_EXPIRY_MS),
  );

  const newExchange: ExchangeDoc = {
    fromUid: callerUid,
    toUid: "",
    fromUserName,
    toUserName: "",
    eggId,
    eggName: `${egg.sourceUserName}の卵`,
    createdAt: Timestamp.fromDate(now),
    completedAt: "",
    meetingContext: "共有URL経由",
    status: "pending",
    expiresAt,
    shareMethod: "url",
  };

  await deps.setExchange(exchangeId, newExchange);

  return {exchangeId};
}

export const createUrlExchange = onCall<CreateUrlExchangeInput>(
  {region: "asia-northeast1"},
  async (request) => {
    const db = getFirestore();
    return createUrlExchangeHandler(request.auth?.uid, request.data, {
      getEgg: async (eggId) => {
        const snap = await db.collection(COLLECTIONS.EGGS).doc(eggId).get();
        return snap.exists ? (snap.data() as EggDoc) : null;
      },
      getUser: async (uid) => {
        const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
        return snap.exists ? (snap.data() as UserDoc) : null;
      },
      setExchange: async (id, doc) => {
        await db.collection(COLLECTIONS.EXCHANGES).doc(id).set(doc);
      },
      now: () => new Date(),
      generateId: () => randomUUID(),
    });
  },
);
