/**
 * Firestore data model type definitions.
 *
 * Compatible with both firebase/firestore (client SDK) and
 * firebase-admin/firestore (admin SDK) via structural typing.
 *
 * DateLike allows either a Firestore Timestamp object or an ISO 8601 string,
 * letting callers work in whichever representation suits them.
 *
 * Refer to docs/requirements/firestore-schema-refinement.md for the
 * design rationale (deterministic IDs, denormalized display fields,
 * messages-as-subcollection, etc.).
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Minimal structural interface satisfied by both SDK Timestamp classes. */
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

/** Subcollection names (nested under a parent document). */
export const SUBCOLLECTIONS = {
  /** chats/{chatId}/messages/{messageId} */
  CHAT_MESSAGES: "messages",
  /** passions/{passionId}/makingMessages/{messageId} */
  PASSION_MAKING_MESSAGES: "makingMessages",
} as const;

export type SubcollectionName =
  (typeof SUBCOLLECTIONS)[keyof typeof SUBCOLLECTIONS];

// ---------------------------------------------------------------------------
// Deterministic ID helpers
// ---------------------------------------------------------------------------

/**
 * A character document shares its ID with the egg it hatched from
 * (1 egg ↔ 1 character). Use this helper to keep both sides in sync.
 */
export const characterIdFromEggId = (eggId: string): string => eggId;

/**
 * A chat between a character and a user has a deterministic ID so the
 * document can be fetched directly without a where-query.
 */
export const chatIdFor = (characterId: string, userUid: string): string =>
  `${characterId}_${userUid}`;

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
  /** Last profile update time */
  updatedAt: DateLike;
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
  visibility: "public" | "friends" | "private";
  /** Input summary normalized for AI interview prompt */
  overview?: string;
  /** Interview lifecycle */
  makingStatus?: "draft" | "interviewing" | "finalized";
  /** Extracted unique attractions of the passion subject */
  subjectAttractions?: string[];
  /** Conversation history used in character-making deep-dive chat */
  chatHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  }>;
}

/** eggs/{eggId} */
export interface EggDoc {
  /** UID of the user whose passion generated this egg */
  sourceUserUid: string;
  /** Display-time denormalised copy of the source user's name */
  sourceUserName: string;
  /** IDs of the passions that shaped this egg */
  basedOnPassionIds: string[];
  /** System prompt used to generate the character */
  characterPrompt: string;
  /** Hatch progress (e.g. 0–100) */
  hatchLevel: number;
  /** Whether this egg has already hatched into a character */
  hatched: boolean;
  /** Creation time */
  createdAt: DateLike;
  /** UID of the user currently holding the egg */
  currentOwnerUid: string;
}

/**
 * characters/{characterId}
 *
 * `characterId` is intentionally equal to the originating egg's id
 * (`characterIdFromEggId`). The bidirectional link can be navigated
 * without an extra query.
 */
export interface CharacterDoc {
  /** ID of the egg this character hatched from (== characterId) */
  eggId: string;
  /** UID of the user who currently owns this character */
  ownerUid: string;
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
  /** Condensed passion memory injected into growing chat */
  passionMemory?: {
    overview: string;
    attractions: string[];
  };
  /** Creation time */
  createdAt: DateLike;
  /** Last interaction / growth update time */
  updatedAt: DateLike;
}

/** Lifecycle status of an exchange. */
export type ExchangeStatus = "pending" | "completed" | "expired";

/** How the exchange was initiated. */
export type ExchangeShareMethod = "qr" | "url";

/** exchanges/{exchangeId} */
export interface ExchangeDoc {
  /** UID of the user who gave the egg */
  fromUid: string;
  /** UID of the user who received the egg. Empty string while status === 'pending'. */
  toUid: string;
  /** Denormalised display name of the giver */
  fromUserName: string;
  /** Denormalised display name of the receiver. Empty string while status === 'pending'. */
  toUserName: string;
  /** ID of the exchanged egg */
  eggId: string;
  /** Denormalised display name of the egg/character */
  eggName: string;
  /** When this exchange doc was created (pending). Always set. */
  createdAt: DateLike;
  /** When the exchange transitioned to 'completed'. Empty string while pending. */
  completedAt: DateLike;
  /** Context of the meeting (event name, location, etc.) */
  meetingContext: string;
  /** Lifecycle status. 'pending' on creation; 'completed' once handed off. */
  status: ExchangeStatus;
  /** When the share token stops being valid (URL exchanges; 24h after creation). */
  expiresAt: DateLike;
  /** Channel that initiated this exchange. */
  shareMethod: ExchangeShareMethod;
}

/**
 * chats/{chatId}/messages/{messageId}
 *
 * Stored as a subcollection (not as an array on ChatDoc) so that:
 *   - appending a message costs a single addDoc
 *   - the latest N messages can be read with limit(N)
 *   - the 1MB document size cap doesn't apply
 */
export interface ChatMessageDoc {
  /** Message author */
  role: "user" | "character";
  /** Text content */
  content: string;
  /** Message send time */
  createdAt: DateLike;
  /** Optional growth score for this user message */
  score?: number;
  /** Why the message got this score */
  scoreReason?: string;
}

/** passions/{passionId}/makingMessages/{messageId} */
export interface PassionMakingMessageDoc {
  role: "user" | "assistant";
  content: string;
  createdAt: DateLike;
}

/**
 * chats/{chatId}
 *
 * `chatId` is the deterministic `${characterId}_${userUid}` (see `chatIdFor`).
 * Individual messages live in the `messages` subcollection.
 */
export interface ChatDoc {
  /** ID of the character participating in this chat */
  characterId: string;
  /** UID of the human user */
  userUid: string;
  /** Preview snippet of the most recent message (denormalised) */
  lastMessagePreview: string;
  /** Time of the most recent message */
  updatedAt: DateLike;
}
