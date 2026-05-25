import { describe, expect, it } from "vitest";
import {
  CreateUrlExchangeDeps,
  createUrlExchangeHandler,
} from "./createUrlExchange";
import { EggDoc, ExchangeDoc, UserDoc } from "../types/firestore";

const FIXED_NOW = new Date("2026-05-25T10:00:00Z");
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function makeDeps(overrides: {
  egg?: EggDoc | null;
  user?: UserDoc | null;
}): {
  deps: CreateUrlExchangeDeps;
  saved: { id: string; doc: ExchangeDoc }[];
} {
  const saved: { id: string; doc: ExchangeDoc }[] = [];
  const deps: CreateUrlExchangeDeps = {
    getEgg: async () => overrides.egg ?? null,
    getUser: async () => overrides.user ?? null,
    setExchange: async (id, doc) => {
      saved.push({ id, doc });
    },
    now: () => FIXED_NOW,
    generateId: () => "exchange-uuid-1",
  };
  return { deps, saved };
}

const validEgg: EggDoc = {
  sourceUserUid: "alice",
  sourceUserName: "Alice",
  basedOnPassionIds: ["p1"],
  characterPrompt: "...",
  hatchLevel: 0,
  hatched: false,
  createdAt: FIXED_NOW.toISOString(),
  currentOwnerUid: "alice",
};

const validUser: UserDoc = {
  name: "Alice",
  iconUrl: "",
  createdAt: FIXED_NOW.toISOString(),
  updatedAt: FIXED_NOW.toISOString(),
  favoriteTags: [],
};

describe("createUrlExchangeHandler", () => {
  it("creates a pending exchange document with 24h expiry when caller owns the egg", async () => {
    const { deps, saved } = makeDeps({ egg: validEgg, user: validUser });

    const result = await createUrlExchangeHandler(
      "alice",
      { eggId: "egg-1" },
      deps,
    );

    expect(result).toEqual({ exchangeId: "exchange-uuid-1" });
    expect(saved).toHaveLength(1);
    const { id, doc } = saved[0];
    expect(id).toBe("exchange-uuid-1");
    expect(doc.status).toBe("pending");
    expect(doc.shareMethod).toBe("url");
    expect(doc.fromUid).toBe("alice");
    expect(doc.fromUserName).toBe("Alice");
    expect(doc.toUid).toBe("");
    expect(doc.toUserName).toBe("");
    expect(doc.eggId).toBe("egg-1");
    expect(doc.completedAt).toBe("");
    expect(doc.meetingContext).toBe("共有URL経由");

    const createdAt = doc.createdAt as { toMillis: () => number };
    expect(createdAt.toMillis()).toBe(FIXED_NOW.getTime());

    const expiresAt = doc.expiresAt as { toMillis: () => number };
    expect(expiresAt.toMillis()).toBe(FIXED_NOW.getTime() + ONE_DAY_MS);
  });

  it("rejects with unauthenticated when callerUid is missing", async () => {
    const { deps } = makeDeps({ egg: validEgg, user: validUser });
    await expect(
      createUrlExchangeHandler(undefined, { eggId: "egg-1" }, deps),
    ).rejects.toMatchObject({ code: "unauthenticated" });
  });

  it("rejects with invalid-argument when eggId is empty", async () => {
    const { deps } = makeDeps({ egg: validEgg, user: validUser });
    await expect(
      createUrlExchangeHandler("alice", { eggId: "" }, deps),
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("rejects with not-found when egg does not exist", async () => {
    const { deps } = makeDeps({ egg: null, user: validUser });
    await expect(
      createUrlExchangeHandler("alice", { eggId: "egg-missing" }, deps),
    ).rejects.toMatchObject({ code: "not-found" });
  });

  it("rejects with permission-denied when caller is not the current owner", async () => {
    const { deps } = makeDeps({
      egg: { ...validEgg, currentOwnerUid: "bob" },
      user: validUser,
    });
    await expect(
      createUrlExchangeHandler("alice", { eggId: "egg-1" }, deps),
    ).rejects.toMatchObject({ code: "permission-denied" });
  });

  it("falls back to empty fromUserName when user doc is missing", async () => {
    const { deps, saved } = makeDeps({ egg: validEgg, user: null });
    await createUrlExchangeHandler("alice", { eggId: "egg-1" }, deps);
    expect(saved[0].doc.fromUserName).toBe("");
  });
});
