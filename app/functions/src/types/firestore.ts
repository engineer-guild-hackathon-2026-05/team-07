/**
 * Firestore data model types for Cloud Functions.
 *
 * Mirrors app/src/types/firestore.ts. Keep the two files in sync.
 * Both use a structural FirestoreTimestamp interface that is satisfied by
 * firebase-admin/firestore Timestamp without a direct import, so Functions
 * can stay in the admin SDK domain while sharing the same type shapes.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Minimal structural interface satisfied by firebase-admin Timestamp. */
export interface FirestoreTimestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

/** Firestore Timestamp or ISO 8601 string. */
export type DateLike = FirestoreTimestamp | string;

// ---------------------------------------------------------------------------
// Collection name constants
// ---------------------------------------------------------------------------

export const COLLECTIONS = {
  USERS: "users",
  PASSIONS: "passions",
  EGGS: "eggs",
  CHARACTERS: "characters",
  EXCHANGES: "exchanges",
  CHATS: "chats",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ---------------------------------------------------------------------------
// Document types
// ---------------------------------------------------------------------------

/** users/{uid} */
export interface UserDoc {
  /** Display name */
  name: string;
  /** URL of the user's profile icon */
  iconUrl: string;
  /** Account creation time */
  createdAt: DateLike;
  /** Tags the user is interested in */
  favoriteTags: string[];
}

/** passions/{passionId} */
export interface PassionDoc {
  /** UID of the user who created this passion */
  ownerUid: string;
  /** Short title */
  title: string;
  /** Long-form description */
  description: string;
  /** Classification tags */
  tags: string[];
  /** Vector embedding for similarity search */
  embedding: number[];
  /** Creation time */
  createdAt: DateLike;
  /** Visibility scope */
  visibility: "public" | "private";
}

/** eggs/{eggId} */
export interface EggDoc {
  /** UID of the user whose passion generated this egg */
  sourceUserUid: string;
  /** IDs of the passions that shaped this egg */
  basedOnPassionIds: string[];
  /** System prompt used to generate the character */
  characterPrompt: string;
  /** Hatch progress (e.g. 0–100) */
  hatchLevel: number;
  /** Creation time */
  createdAt: DateLike;
  /** UID of the user currently holding the egg */
  currentOwnerUid: string;
}

/** characters/{characterId} */
export interface CharacterDoc {
  /** ID of the egg this character hatched from */
  eggId: string;
  /** Character name */
  name: string;
  /** Personality description */
  personality: string;
  /** Knowledge domains the character specialises in */
  knowledgeAreas: string[];
  /** Overall growth level */
  growthLevel: number;
  /** Affinity score with the current owner */
  affinityScore: number;
  /** Topics unlocked through accumulated conversation */
  unlockedTopics: string[];
}

/** exchanges/{exchangeId} */
export interface ExchangeDoc {
  /** UID of the user who gave the egg */
  fromUid: string;
  /** UID of the user who received the egg */
  toUid: string;
  /** ID of the exchanged egg */
  eggId: string;
  /** Exchange time */
  createdAt: DateLike;
  /** Context of the meeting (event name, location, etc.) */
  meetingContext: string;
}

/** Single message entry stored inside ChatDoc.messages */
export interface ChatMessageDoc {
  /** Message author */
  role: "user" | "character";
  /** Text content */
  content: string;
  /** Message send time */
  createdAt: DateLike;
}

/** chats/{chatId} */
export interface ChatDoc {
  /** ID of the character participating in this chat */
  characterId: string;
  /** UID of the human user */
  userUid: string;
  /** Ordered message history */
  messages: ChatMessageDoc[];
  /** Time of the most recent message */
  updatedAt: DateLike;
}
