import { describe, expect, it } from "vitest";
import {
  CompleteExchangeDeps,
  CompleteExchangeTx,
  completeExchangeHandler,
} from "./completeExchange";
import { EggDoc, ExchangeDoc, UserDoc } from "../types/firestore";

const FIXED_NOW = new Date("2026-05-25T10:00:00Z");
const ONE_HOUR_MS = 60 * 60 * 1000;

const fakeTimestamp = (date: Date) => ({
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: 0,
  toDate: () => date,
  toMillis: () => date.getTime(),
});

interface FakeState {
  exchanges: Record<string, ExchangeDoc>;
  eggs: Record<string, EggDoc>;
}

function makeDeps(state: FakeState, bobUser: UserDoc | null = baseUser("Bob")): {
  deps: CompleteExchangeDeps;
  state: FakeState;
} {
  const deps: CompleteExchangeDeps = {
    runTransaction: async (fn) => {
      const tx: CompleteExchangeTx = {
        getExchange: async (id) => state.exchanges[id] ?? null,
        getEgg: async (id) => state.eggs[id] ?? null,
        updateExchange: (id, partial) => {
          state.exchanges[id] = { ...state.exchanges[id], ...partial };
        },
        updateEgg: (id, partial) => {
          state.eggs[id] = { ...state.eggs[id], ...partial };
        },
      };
      return fn(tx);
    },
    getUser: async () => bobUser,
    now: () => FIXED_NOW,
  };
  return { deps, state };
}

function baseUser(name: string): UserDoc {
  return {
    name,
    iconUrl: "",
    createdAt: FIXED_NOW.toISOString(),
    updatedAt: FIXED_NOW.toISOString(),
    favoriteTags: [],
  };
}

function pendingExchange(overrides: Partial<ExchangeDoc> = {}): ExchangeDoc {
  return {
    fromUid: "alice",
    toUid: "",
    fromUserName: "Alice",
    toUserName: "",
    eggId: "egg-1",
    eggName: "Aliceの卵",
    createdAt: fakeTimestamp(new Date(FIXED_NOW.getTime() - ONE_HOUR_MS)),
    completedAt: "",
    meetingContext: "共有URL経由",
    status: "pending",
    expiresAt: fakeTimestamp(new Date(FIXED_NOW.getTime() + ONE_HOUR_MS)),
    shareMethod: "url",
    ...overrides,
  };
}

function aliceEgg(overrides: Partial<EggDoc> = {}): EggDoc {
  return {
    sourceUserUid: "alice",
    sourceUserName: "Alice",
    basedOnPassionIds: ["p1"],
    characterPrompt: "...",
    hatchLevel: 0,
    hatched: false,
    createdAt: FIXED_NOW.toISOString(),
    currentOwnerUid: "alice",
    ...overrides,
  };
}

describe("completeExchangeHandler", () => {
  it("transfers egg ownership and marks exchange completed on happy path", async () => {
    const state: FakeState = {
      exchanges: { "ex-1": pendingExchange() },
      eggs: { "egg-1": aliceEgg() },
    };
    const { deps } = makeDeps(state);

    const result = await completeExchangeHandler(
      "bob",
      { exchangeId: "ex-1" },
      deps,
    );

    expect(result).toEqual({
      exchangeId: "ex-1",
      characterId: "egg-1",
      eggId: "egg-1",
    });
    expect(state.eggs["egg-1"].currentOwnerUid).toBe("bob");
    expect(state.exchanges["ex-1"].status).toBe("completed");
    expect(state.exchanges["ex-1"].toUid).toBe("bob");
    expect(state.exchanges["ex-1"].toUserName).toBe("Bob");
    expect(state.exchanges["ex-1"].completedAt).not.toBe("");

    const completedAt =
      state.exchanges["ex-1"].completedAt as { toMillis: () => number };
    expect(completedAt.toMillis()).toBe(FIXED_NOW.getTime());
  });

  it("rejects with internal when exchange doc is missing required fields", async () => {
    const malformed = {...pendingExchange(), status: undefined} as unknown as
      import("../types/firestore").ExchangeDoc;
    const { deps } = makeDeps({
      exchanges: {"ex-1": malformed},
      eggs: {"egg-1": aliceEgg()},
    });
    await expect(
      completeExchangeHandler("bob", {exchangeId: "ex-1"}, deps),
    ).rejects.toMatchObject({code: "internal"});
  });

  it("rejects with unauthenticated when callerUid is missing", async () => {
    const { deps } = makeDeps({
      exchanges: { "ex-1": pendingExchange() },
      eggs: { "egg-1": aliceEgg() },
    });
    await expect(
      completeExchangeHandler(undefined, { exchangeId: "ex-1" }, deps),
    ).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("rejects with invalid-argument when exchangeId is missing", async () => {
    const { deps } = makeDeps({ exchanges: {}, eggs: {} });
    await expect(
      completeExchangeHandler("bob", { exchangeId: "" }, deps),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("rejects with not-found when exchange does not exist", async () => {
    const { deps } = makeDeps({ exchanges: {}, eggs: {} });
    await expect(
      completeExchangeHandler("bob", { exchangeId: "ex-missing" }, deps),
    ).rejects.toMatchObject({ code: "not-found" });
  });

  it("rejects with failed-precondition when exchange already completed", async () => {
    const state: FakeState = {
      exchanges: { "ex-1": pendingExchange({ status: "completed" }) },
      eggs: { "egg-1": aliceEgg({ currentOwnerUid: "carol" }) },
    };
    const { deps } = makeDeps(state);
    await expect(
      completeExchangeHandler("bob", { exchangeId: "ex-1" }, deps),
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("rejects with deadline-exceeded when expiresAt has passed", async () => {
    const state: FakeState = {
      exchanges: {
        "ex-1": pendingExchange({
          expiresAt: fakeTimestamp(new Date(FIXED_NOW.getTime() - ONE_HOUR_MS)),
        }),
      },
      eggs: { "egg-1": aliceEgg() },
    };
    const { deps } = makeDeps(state);
    await expect(
      completeExchangeHandler("bob", { exchangeId: "ex-1" }, deps),
    ).rejects.toMatchObject({ code: "deadline-exceeded" });
  });

  it("rejects with permission-denied when caller is the giver (self-exchange)", async () => {
    const { deps } = makeDeps({
      exchanges: { "ex-1": pendingExchange() },
      eggs: { "egg-1": aliceEgg() },
    });
    await expect(
      completeExchangeHandler("alice", { exchangeId: "ex-1" }, deps),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("rejects with internal when referenced egg is missing", async () => {
    const { deps } = makeDeps({
      exchanges: { "ex-1": pendingExchange() },
      eggs: {},
    });
    await expect(
      completeExchangeHandler("bob", { exchangeId: "ex-1" }, deps),
    ).rejects.toMatchObject({ code: "internal" });
  });

  it("falls back to empty toUserName when user doc is missing", async () => {
    const state: FakeState = {
      exchanges: { "ex-1": pendingExchange() },
      eggs: { "egg-1": aliceEgg() },
    };
    const { deps } = makeDeps(state, null);
    await completeExchangeHandler("bob", { exchangeId: "ex-1" }, deps);
    expect(state.exchanges["ex-1"].toUserName).toBe("");
  });
});
