/* eslint-disable max-len */
import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../admin.js";
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

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const HISTORY_LIMIT = 10;
const RATE_LIMIT_MS = 2000;

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

type ScoreResult = {
  score: number;
  reason: string;
};

/**
 * Clamps score into 0-100 integer range.
 * @param {number} score Raw score.
 * @return {number} Clamped score.
 */
function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Parses score JSON from model output.
 * @param {string} text Raw model output.
 * @return {ScoreResult} Parsed score and reason.
 */
function parseScoreResult(text: string): ScoreResult {
  try {
    const parsed = JSON.parse(text) as { score?: unknown; reason?: unknown };
    if (typeof parsed.score === "number" && typeof parsed.reason === "string") {
      return {score: clampScore(parsed.score), reason: parsed.reason};
    }
  } catch {
    // fallback
  }
  return {score: 50, reason: "採点の解析に失敗したため中立値を適用"};
}

export const sendMessage = onCall(
  {region: "asia-northeast1"},
  async (request) => {
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

    const characterRef = db.collection(COLLECTIONS.CHARACTERS).doc(characterId);
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

    const eggSnap = await db.collection(COLLECTIONS.EGGS).doc(characterId).get();
    const egg = eggSnap.exists ? (eggSnap.data() as EggDoc) : null;

    const chatId = chatIdFor(characterId, uid);
    const chatRef = db.collection(COLLECTIONS.CHATS).doc(chatId);
    const chatSnap = await chatRef.get();

    if (chatSnap.exists) {
      const chatData = chatSnap.data() as ChatDoc;
      const updatedAt = chatData.updatedAt;
      const lastMs =
        typeof updatedAt === "string" ?
          new Date(updatedAt).getTime() :
          updatedAt.toMillis();
      if (Date.now() - lastMs < RATE_LIMIT_MS) {
        throw new HttpsError(
          "resource-exhausted",
          "メッセージの送信が速すぎます。しばらくお待ちください。",
        );
      }
    }

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

    const passionMemory = character.passionMemory ?? {overview: "", attractions: []};
    const passionAttractionsText =
      passionMemory.attractions.length > 0 ?
        passionMemory.attractions.join(" / ") :
        "未設定";

    const systemParts = [
      characterGrowingPrompt.systemPrompt,
      `キャラクター名: ${character.name}`,
      `性格・特徴: ${character.personality}`,
      `専門知識領域: ${character.knowledgeAreas.join("、")}`,
      `偏愛概要: ${passionMemory.overview || "未設定"}`,
      `偏愛対象の魅力: ${passionAttractionsText}`,
    ];
    if (egg?.characterPrompt) {
      systemParts.push(`キャラクタープロンプト: ${egg.characterPrompt}`);
    }
    const systemPrompt = systemParts.join("\n");

    const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
    const messages: OpenAIMessage[] = [
      {role: "system", content: systemPrompt},
      ...history,
      {role: "user", content: userMessage},
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({model, input: messages}),
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

    const scorePrompt = [
      "あなたは偏愛育成コーチです。ユーザー発話の質を0~100で採点してください。",
      "評価観点: 偏愛対象の具体性/独自性/体験の深さ。",
      `偏愛概要: ${passionMemory.overview || "未設定"}`,
      `偏愛魅力: ${passionAttractionsText}`,
      `ユーザー発話: ${userMessage}`,
      "JSONのみで返答: {\"score\": number, \"reason\": string}",
    ].join("\n");

    const scoreResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({model, input: [{role: "user", content: scorePrompt}]}),
    });
    const scoreText = scoreResponse.ok ?
      ((await scoreResponse.json()) as OpenAIResponsesOutput).output_text?.trim() ?? "" :
      "";
    const scoreResult = parseScoreResult(scoreText);

    const now = FieldValue.serverTimestamp();
    const batch = db.batch();

    batch.set(messagesRef.doc(), {
      role: "user",
      content: userMessage,
      createdAt: now,
      score: scoreResult.score,
      scoreReason: scoreResult.reason,
    });

    batch.set(messagesRef.doc(), {
      role: "character",
      content: reply,
      createdAt: now,
    });

    batch.set(
      chatRef,
      {
        characterId,
        userUid: uid,
        lastMessagePreview: reply.slice(0, 100),
        updatedAt: now,
      },
      {merge: true},
    );

    const affinityDelta = Math.max(-2, Math.floor((scoreResult.score - 50) / 10));
    batch.update(characterRef, {
      affinityScore: FieldValue.increment(affinityDelta),
      updatedAt: now,
    });

    await batch.commit();

    return {reply, score: scoreResult.score, scoreReason: scoreResult.reason};
  },
);
