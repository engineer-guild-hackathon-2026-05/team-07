import {describe, expect, it} from "vitest";
import {
  HATCH_COMPLETE_LEVEL,
  HATCH_PROGRESS_PER_MESSAGE,
  advanceHatchProgressHandler,
  type AdvanceHatchProgressDeps,
} from "./advanceHatchProgress";
import type {CharacterDoc, EggDoc, PassionDoc} from "../types/firestore";

const baseEgg = (overrides: Partial<EggDoc> = {}): EggDoc => ({
  sourceUserUid: "alice",
  sourceUserName: "Alice",
  basedOnPassionIds: ["passion-1"],
  characterPrompt: "旅好きの案内役",
  hatchLevel: 12,
  hatched: false,
  createdAt: "2026-05-25T10:00:00.000Z",
  currentOwnerUid: "bob",
  ...overrides,
});

const basePassion = (): PassionDoc => ({
  ownerUid: "alice",
  title: "タビトル",
  description: "旅先の朝市が好き",
  tags: ["旅", "朝"],
  embedding: [],
  createdAt: "2026-05-25T10:00:00.000Z",
  visibility: "public",
  overview: "旅先の朝市",
  subjectAttractions: ["地元の会話", "朝の匂い"],
});

function makeDeps(state: {
  eggs: Record<string, EggDoc>;
  characters: Record<string, CharacterDoc>;
  passions: Record<string, PassionDoc>;
}): AdvanceHatchProgressDeps {
  return {
    getEgg: async (eggId) => state.eggs[eggId] ?? null,
    getCharacter: async (characterId) => state.characters[characterId] ?? null,
    getPassion: async (passionId) => state.passions[passionId] ?? null,
    updateEgg: async (eggId, partial) => {
      state.eggs[eggId] = {...state.eggs[eggId], ...partial};
    },
    createCharacter: async (characterId, doc) => {
      state.characters[characterId] = doc;
    },
  };
}

describe("advanceHatchProgressHandler", () => {
  it("requires authentication", async () => {
    await expect(
      advanceHatchProgressHandler(undefined, {eggId: "egg-1"}, makeDeps({
        eggs: {},
        characters: {},
        passions: {},
      })),
    ).rejects.toMatchObject({code: "unauthenticated"});
  });

  it("rejects when caller does not own the egg", async () => {
    const state = {
      eggs: {"egg-1": baseEgg({currentOwnerUid: "alice"})},
      characters: {},
      passions: {},
    };

    await expect(
      advanceHatchProgressHandler("bob", {eggId: "egg-1"}, makeDeps(state)),
    ).rejects.toMatchObject({code: "permission-denied"});
  });

  it("increments hatchLevel without hatching below threshold", async () => {
    const state = {
      eggs: {"egg-1": baseEgg()},
      characters: {},
      passions: {"passion-1": basePassion()},
    };

    const result = await advanceHatchProgressHandler(
      "bob",
      {eggId: "egg-1"},
      makeDeps(state),
    );

    expect(result).toEqual({
      eggId: "egg-1",
      hatchLevel: 12 + HATCH_PROGRESS_PER_MESSAGE,
      hatched: false,
    });
    expect(state.eggs["egg-1"].hatched).toBe(false);
    expect(state.characters["egg-1"]).toBeUndefined();
  });

  it("creates character doc when hatchLevel reaches 100", async () => {
    const state = {
      eggs: {"egg-1": baseEgg({hatchLevel: HATCH_COMPLETE_LEVEL - HATCH_PROGRESS_PER_MESSAGE})},
      characters: {},
      passions: {"passion-1": basePassion()},
    };

    const result = await advanceHatchProgressHandler(
      "bob",
      {eggId: "egg-1"},
      makeDeps(state),
    );

    expect(result.hatched).toBe(true);
    expect(result.characterId).toBe("egg-1");
    expect(state.eggs["egg-1"].hatched).toBe(true);
    expect(state.characters["egg-1"]).toMatchObject({
      eggId: "egg-1",
      ownerUid: "bob",
      name: "タビトル",
      personality: "旅好きの案内役",
      knowledgeAreas: ["旅", "朝"],
    });
  });

  it("returns existing hatched state without duplicate writes", async () => {
    const state = {
      eggs: {"egg-1": baseEgg({hatchLevel: 100, hatched: true})},
      characters: {
        "egg-1": {
          eggId: "egg-1",
          ownerUid: "bob",
          name: "タビトル",
          personality: "旅好きの案内役",
          knowledgeAreas: ["旅"],
          growthLevel: 1,
          affinityScore: 20,
          unlockedTopics: ["好き"],
          createdAt: "2026-05-25T10:00:00.000Z",
          updatedAt: "2026-05-25T10:00:00.000Z",
        },
      },
      passions: {},
    };

    const result = await advanceHatchProgressHandler(
      "bob",
      {eggId: "egg-1"},
      makeDeps(state),
    );

    expect(result).toEqual({
      eggId: "egg-1",
      hatchLevel: 100,
      hatched: true,
      characterId: "egg-1",
    });
  });
});
