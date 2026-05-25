import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../admin.js";
import {
  COLLECTIONS,
  SUBCOLLECTIONS,
  chatIdFor,
} from "../types/firestore.js";
import type {
  CharacterDoc,
  EggDoc,
  ChatDoc,
  ChatMessageDoc,
} from "../types/firestore.js";
import characterGrowingPrompt from "../prompts/character_growing.json";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const HISTORY_LIMIT = 10;
const RATE_LIMIT_MS = 2000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SendMessageRequest = {
  characterId: string;
  userMessage: string;
};

type OpenAIResponsesOutput = {
  output_text?: string;
};

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// ---------------------------------------------------------------------------
// Callable
// ---------------------------------------------------------------------------

export const sendMessage = onCall(
  { region: "asia-northeast1" },
  async (request) => {
    // 1. Auth
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です。");
    }
    const uid = request.auth.uid;

    const data = request.data as SendMessageRequest | undefined;
    const characterId = data?.characterId?.trim();
    const userMessage = data?.userMessage?.trim();

    if (!characterId || !userMessage) {
      throw new HttpsError(
        "invalid-argument",
        "characterId と userMessage は必須です。",
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "OPENAI_API_KEY が未設定です。",
      );
    }

    // 2. キャラクター取得 + オーナー確認
    const characterRef = db
      .collection(COLLECTIONS.CHARACTERS)
      .doc(characterId);
    const characterSnap = await characterRef.get();
    if (!characterSnap.exists) {
      throw new HttpsError("not-found", "キャラクターが見つかりません。");
    }
    const character = characterSnap.data() as CharacterDoc;
    if (character.ownerUid !== uid) {
      throw new HttpsError(
        "permission-denied",
        "このキャラクターへのアクセス権がありません。",
      );
    }

    // 3. 卵からキャラクタープロンプトを取得 (eggId === characterId)
    const eggSnap = await db
      .collection(COLLECTIONS.EGGS)
      .doc(characterId)
      .get();
    const egg = eggSnap.exists ? (eggSnap.data() as EggDoc) : null;

    // 4. レート制限: 前回更新から RATE_LIMIT_MS 以内は拒否
    const chatId = chatIdFor(characterId, uid);
    const chatRef = db.collection(COLLECTIONS.CHATS).doc(chatId);
    const chatSnap = await chatRef.get();

    if (chatSnap.exists) {
      const chatData = chatSnap.data() as ChatDoc;
      const updatedAt = chatData.updatedAt;
      const lastMs =
        typeof updatedAt === "string"
          ? new Date(updatedAt).getTime()
          : updatedAt.toMillis();
      if (Date.now() - lastMs < RATE_LIMIT_MS) {
        throw new HttpsError(
          "resource-exhausted",
          "メッセージの送信が速すぎます。しばらくお待ちください。",
        );
      }
    }

    // 5. 直近の会話履歴を取得
    const messagesRef = chatRef.collection(SUBCOLLECTIONS.CHAT_MESSAGES);
    const historySnap = await messagesRef
      .orderBy("createdAt", "desc")
      .limit(HISTORY_LIMIT)
      .get();

    const history: OpenAIMessage[] = historySnap.docs.reverse().map((d) => {
      const msg = d.data() as ChatMessageDoc;
      return {
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      };
    });

    // 6. システムプロンプト構築
    const systemParts = [
      characterGrowingPrompt.systemPrompt,
      `キャラクター名: ${character.name}`,
      `性格・特徴: ${character.personality}`,
      `専門知識領域: ${character.knowledgeAreas.join("、")}`,
    ];
    if (egg?.characterPrompt) {
      systemParts.push(`キャラクタープロンプト: ${egg.characterPrompt}`);
    }
    const systemPrompt = systemParts.join("\n");

    // 7. OpenAI 呼び出し
    const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
    const messages: OpenAIMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, input: messages }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new HttpsError(
        "internal",
        `OpenAI API error (${response.status}): ${body}`,
      );
    }

    const json = (await response.json()) as OpenAIResponsesOutput;
    const reply = json.output_text?.trim();
    if (!reply) {
      throw new HttpsError(
        "internal",
        "OpenAI から応答を取得できませんでした。",
      );
    }

    // 8. Firestore へ書き込み (バッチ)
    const now = FieldValue.serverTimestamp();
    const batch = db.batch();

    // user メッセージ
    batch.set(messagesRef.doc(), {
      role: "user",
      content: userMessage,
      createdAt: now,
    });

    // character メッセージ
    batch.set(messagesRef.doc(), {
      role: "character",
      content: reply,
      createdAt: now,
    });

    // ChatDoc を upsert
    batch.set(
      chatRef,
      {
        characterId,
        userUid: uid,
        lastMessagePreview: reply.slice(0, 100),
        updatedAt: now,
      },
      { merge: true },
    );

    // 9. affinityScore を微増
    batch.update(characterRef, {
      affinityScore: FieldValue.increment(1),
      updatedAt: now,
    });

    await batch.commit();

    return { reply };
  },
);
