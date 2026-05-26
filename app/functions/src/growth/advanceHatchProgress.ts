import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../admin.js";
import {
  COLLECTIONS,
  characterIdFromEggId,
  type CharacterDoc,
  type EggDoc,
  type PassionDoc,
} from "../types/firestore.js";

export const HATCH_PROGRESS_PER_MESSAGE = 15;
export const HATCH_COMPLETE_LEVEL = 100;

export type AdvanceHatchProgressInput = {
  eggId: string;
};

export type AdvanceHatchProgressOutput = {
  eggId: string;
  hatchLevel: number;
  hatched: boolean;
  characterId?: string;
};

export interface AdvanceHatchProgressDeps {
  getEgg: (eggId: string) => Promise<EggDoc | null>;
  getCharacter: (characterId: string) => Promise<CharacterDoc | null>;
  getPassion: (passionId: string) => Promise<PassionDoc | null>;
  updateEgg: (eggId: string, partial: Partial<EggDoc>) => Promise<void>;
  createCharacter: (characterId: string, doc: CharacterDoc) => Promise<void>;
}

const buildCharacterDoc = (
  eggId: string,
  egg: EggDoc,
  ownerUid: string,
  passion: PassionDoc | null,
): CharacterDoc => {
  const knowledgeAreas =
    passion?.tags?.length ?
      passion.tags.slice(0, 8) :
      passion?.subjectAttractions?.slice(0, 8) ??
      ["偏愛"];

  const unlockedTopics = passion?.title ?
    [passion.title, "好きになったきっかけ"] :
    ["好きになったきっかけ", "一番語りたい細部"];

  return {
    eggId,
    ownerUid,
    name: passion?.title ?? egg.sourceUserName ?? "ふわもこ",
    personality: egg.characterPrompt,
    knowledgeAreas,
    growthLevel: 1,
    affinityScore: 20,
    unlockedTopics,
    passionMemory: {
      overview: passion?.overview ?? passion?.description ?? "",
      attractions: passion?.subjectAttractions ?? [],
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  } as unknown as CharacterDoc;
};

/**
 * Advances hatch progress for an owned egg. Creates characters/{eggId} at 100%.
 * @param {string|undefined} callerUid Authenticated user uid.
 * @param {AdvanceHatchProgressInput} input Callable input.
 * @param {AdvanceHatchProgressDeps} deps Injected I/O dependencies.
 * @return {Promise<AdvanceHatchProgressOutput>} Updated hatch state.
 */
export async function advanceHatchProgressHandler(
  callerUid: string | undefined,
  input: AdvanceHatchProgressInput | undefined,
  deps: AdvanceHatchProgressDeps,
): Promise<AdvanceHatchProgressOutput> {
  if (!callerUid) {
    throw new HttpsError("unauthenticated", "ログインが必要です。");
  }

  const eggId = input?.eggId?.trim();
  if (!eggId) {
    throw new HttpsError("invalid-argument", "eggId は必須です。");
  }

  const egg = await deps.getEgg(eggId);
  if (!egg) {
    throw new HttpsError("not-found", "卵が見つかりません。");
  }

  if (egg.currentOwnerUid !== callerUid) {
    throw new HttpsError("permission-denied", "この卵を育てる権限がありません。");
  }

  const characterId = characterIdFromEggId(eggId);
  const existingCharacter = await deps.getCharacter(characterId);
  if (existingCharacter || egg.hatched) {
    return {
      eggId,
      hatchLevel: egg.hatchLevel,
      hatched: true,
      characterId,
    };
  }

  const hatchLevel = Math.min(
    HATCH_COMPLETE_LEVEL,
    egg.hatchLevel + HATCH_PROGRESS_PER_MESSAGE,
  );
  const hatched = hatchLevel >= HATCH_COMPLETE_LEVEL;

  await deps.updateEgg(eggId, {
    hatchLevel,
    hatched,
  });

  if (!hatched) {
    return {eggId, hatchLevel, hatched: false};
  }

  const passionId = egg.basedOnPassionIds[0];
  const passion = passionId ? await deps.getPassion(passionId) : null;
  const characterDoc = buildCharacterDoc(eggId, egg, callerUid, passion);
  await deps.createCharacter(characterId, characterDoc);

  return {
    eggId,
    hatchLevel,
    hatched: true,
    characterId,
  };
}

export const advanceHatchProgress = onCall(
  {region: "asia-northeast1"},
  async (request) => {
    const data = request.data as AdvanceHatchProgressInput | undefined;
    return advanceHatchProgressHandler(request.auth?.uid, data, {
      getEgg: async (eggId) => {
        const snap = await db.collection(COLLECTIONS.EGGS).doc(eggId).get();
        return snap.exists ? (snap.data() as EggDoc) : null;
      },
      getCharacter: async (characterId) => {
        const snap = await db.collection(COLLECTIONS.CHARACTERS).doc(characterId).get();
        return snap.exists ? (snap.data() as CharacterDoc) : null;
      },
      getPassion: async (passionId) => {
        const snap = await db.collection(COLLECTIONS.PASSIONS).doc(passionId).get();
        return snap.exists ? (snap.data() as PassionDoc) : null;
      },
      updateEgg: async (eggId, partial) => {
        await db.collection(COLLECTIONS.EGGS).doc(eggId).update(partial);
      },
      createCharacter: async (characterId, doc) => {
        await db.collection(COLLECTIONS.CHARACTERS).doc(characterId).set(doc);
      },
    });
  },
);
