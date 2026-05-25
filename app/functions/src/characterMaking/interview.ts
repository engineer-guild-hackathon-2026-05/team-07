import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../admin.js";
import { COLLECTIONS, SUBCOLLECTIONS } from "../types/firestore.js";
import type { PassionDoc, PassionMakingMessageDoc } from "../types/firestore.js";
import makingStartPrompt from "../prompts/character_making_start.json";
import makingTurnPrompt from "../prompts/character_making_turn.json";
import makingFinalizePrompt from "../prompts/character_making_finalize.json";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const HISTORY_LIMIT = 24;

type OpenAIResponsesOutput = {
  output_text?: string;
};

type InterviewTurn = {
  question: string;
  choices: string[];
};

type StartInterviewInput = { passionId: string };
type ContinueInterviewInput = { passionId: string; userMessage: string };
type FinalizeInterviewInput = { passionId: string };

function requireApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "OPENAI_API_KEY が未設定です。");
  }
  return apiKey;
}

function buildOverview(passion: PassionDoc): string {
  const tags = passion.tags.length > 0 ? passion.tags.map((tag) => `#${tag}`).join(" ") : "#タグなし";
  return `タイトル: ${passion.title}\n概要: ${passion.description}\nタグ: ${tags}`;
}

async function callOpenAi(input: Array<{ role: "system" | "user" | "assistant"; content: string }>): Promise<string> {
  const apiKey = requireApiKey();
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input }),
  });

  if (!response.ok) {
    throw new HttpsError("internal", "AI応答の生成に失敗しました。");
  }

  const json = (await response.json()) as OpenAIResponsesOutput;
  const text = json.output_text?.trim();
  if (!text) {
    throw new HttpsError("internal", "AI応答の生成に失敗しました。");
  }

  return text;
}

function parseInterviewTurn(text: string): InterviewTurn {
  try {
    const parsed = JSON.parse(text) as { question?: unknown; choices?: unknown };
    const question = typeof parsed.question === "string" ? parsed.question.trim() : "";
    const choices = Array.isArray(parsed.choices)
      ? parsed.choices.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter((v) => v.length > 0).slice(0, 3)
      : [];
    if (question) {
      return { question, choices };
    }
  } catch {
    // fallback below
  }
  return { question: text.trim(), choices: [] };
}

async function getPassionOrThrow(uid: string, passionId: string) {
  const passionRef = db.collection(COLLECTIONS.PASSIONS).doc(passionId);
  const snap = await passionRef.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "偏愛データが見つかりません。");
  }
  const passion = snap.data() as PassionDoc;
  if (passion.ownerUid !== uid) {
    throw new HttpsError("permission-denied", "この偏愛にはアクセスできません。");
  }
  return { passionRef, passion };
}

export const startPassionInterview = onCall(
  { region: "asia-northeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "認証が必要です。");
    }
    const uid = request.auth.uid;
    const data = request.data as StartInterviewInput | undefined;
    const passionId = data?.passionId?.trim();
    if (!passionId) {
      throw new HttpsError("invalid-argument", "passionId は必須です。");
    }

    const { passionRef, passion } = await getPassionOrThrow(uid, passionId);
    const overview = passion.overview?.trim() || buildOverview(passion);

    const messagesRef = passionRef.collection(SUBCOLLECTIONS.PASSION_MAKING_MESSAGES);
    const existing = await messagesRef.orderBy("createdAt", "asc").limit(1).get();
    if (!existing.empty) {
      const list = await messagesRef.orderBy("createdAt", "asc").limit(HISTORY_LIMIT).get();
      return {
        overview,
        messages: list.docs.map((d) => d.data() as PassionMakingMessageDoc),
        choices: Array.isArray(passion.latestReplyChoices) ? passion.latestReplyChoices : [],
      };
    }

    const assistantRaw = await callOpenAi([
      {
        role: "system",
        content: makingStartPrompt.systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "start_interview",
          passion: {
            passionId,
            title: passion.title,
            overview,
            tags: passion.tags,
          },
          outputSchema: makingStartPrompt.outputSchema,
        }),
      },
    ]);
    const assistantTurn = parseInterviewTurn(assistantRaw);

    await db.runTransaction(async (tx) => {
      tx.set(
        passionRef,
        {
          overview,
          makingStatus: "interviewing",
          subjectAttractions: passion.subjectAttractions ?? [],
          latestInterviewQuestion: assistantTurn.question,
          latestReplyChoices: assistantTurn.choices,
        },
        { merge: true },
      );
      tx.set(messagesRef.doc(), {
        role: "assistant",
        content: assistantTurn.question,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return {
      overview,
      messages: [{ role: "assistant", content: assistantTurn.question, createdAt: new Date().toISOString() }],
      choices: assistantTurn.choices,
    };
  },
);

export const continuePassionInterview = onCall(
  { region: "asia-northeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "認証が必要です。");
    }
    const uid = request.auth.uid;
    const data = request.data as ContinueInterviewInput | undefined;
    const passionId = data?.passionId?.trim();
    const userMessage = data?.userMessage?.trim();
    if (!passionId || !userMessage) {
      throw new HttpsError("invalid-argument", "passionId と userMessage は必須です。");
    }

    const { passionRef, passion } = await getPassionOrThrow(uid, passionId);
    const overview = passion.overview?.trim() || buildOverview(passion);
    const messagesRef = passionRef.collection(SUBCOLLECTIONS.PASSION_MAKING_MESSAGES);

    const historySnap = await messagesRef.orderBy("createdAt", "desc").limit(HISTORY_LIMIT).get();
    const history = historySnap.docs.reverse().map((d) => {
      const msg = d.data() as PassionMakingMessageDoc;
      return { role: msg.role, content: msg.content };
    });

    const assistantRaw = await callOpenAi([
      {
        role: "system",
        content: makingTurnPrompt.systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "continue_interview",
          passion: {
            passionId,
            title: passion.title,
            overview,
            tags: passion.tags,
          },
          conversation: history,
          userMessage,
          outputSchema: makingTurnPrompt.outputSchema,
        }),
      },
    ]);
    const assistantTurn = parseInterviewTurn(assistantRaw);

    const now = FieldValue.serverTimestamp();
    const batch = db.batch();
    batch.set(messagesRef.doc(), { role: "user", content: userMessage, createdAt: now });
    batch.set(messagesRef.doc(), { role: "assistant", content: assistantTurn.question, createdAt: now });
    batch.set(
      passionRef,
      {
        overview,
        makingStatus: "interviewing",
        latestInterviewQuestion: assistantTurn.question,
        latestReplyChoices: assistantTurn.choices,
      },
      { merge: true },
    );
    await batch.commit();

    return { reply: assistantTurn.question, choices: assistantTurn.choices };
  },
);

export const finalizePassionInterview = onCall(
  { region: "asia-northeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "認証が必要です。");
    }
    const uid = request.auth.uid;
    const data = request.data as FinalizeInterviewInput | undefined;
    const passionId = data?.passionId?.trim();
    if (!passionId) {
      throw new HttpsError("invalid-argument", "passionId は必須です。");
    }

    const { passionRef, passion } = await getPassionOrThrow(uid, passionId);
    const overview = passion.overview?.trim() || buildOverview(passion);
    const messagesRef = passionRef.collection(SUBCOLLECTIONS.PASSION_MAKING_MESSAGES);
    const historySnap = await messagesRef.orderBy("createdAt", "asc").limit(60).get();

    const transcript = historySnap.docs
      .map((d) => {
        const msg = d.data() as PassionMakingMessageDoc;
        return `${msg.role === "user" ? "USER" : "AI"}: ${msg.content}`;
      })
      .join("\n");

    const extraction = await callOpenAi([
      {
        role: "system",
        content: makingFinalizePrompt.systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "extract_attractions",
          passion: {
            passionId,
            title: passion.title,
            overview,
            tags: passion.tags,
          },
          transcript,
          outputSchema: makingFinalizePrompt.outputSchema,
        }),
      },
    ]);

    let attractions: string[] = [];
    try {
      const parsed = JSON.parse(extraction) as { subjectAttractions?: unknown };
      if (Array.isArray(parsed.subjectAttractions)) {
        attractions = parsed.subjectAttractions
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .slice(0, 8);
      }
    } catch {
      // fallback
    }

    if (attractions.length === 0) {
      attractions = ["具体的な体験と感情の深い結びつき", "対象の細部に対する独自視点"];
    }

    await passionRef.set(
      {
        overview,
        subjectAttractions: attractions,
        makingStatus: "finalized",
        latestReplyChoices: [],
      },
      { merge: true },
    );

    return { subjectAttractions: attractions };
  },
);
