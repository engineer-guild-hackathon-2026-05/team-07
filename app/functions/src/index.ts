export { sendMessage } from "./chat/sendMessage.js";

import { HttpsError, onCall } from "firebase-functions/v2/https";
import characterMakingPrompt from "./prompts/character_making.json";
import characterGrowingPrompt from "./prompts/character_growing.json";

type PromptType = "character_making" | "character_growing";

type GenerateAiReplyRequest = {
  promptType: PromptType;
  message: string;
  context?: string;
};

type OpenAIResponsesApiOutput = {
  output_text?: string;
};

type PromptConfig = {
  systemPrompt: string;
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";

const PROMPTS: Record<PromptType, PromptConfig> = {
  character_making: characterMakingPrompt,
  character_growing: characterGrowingPrompt,
};

async function callOpenAi({
  promptType,
  message,
  context,
}: GenerateAiReplyRequest): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new HttpsError(
      "failed-precondition",
      "OPENAI_API_KEY が未設定です。",
    );
  }

  const prompt = PROMPTS[promptType];
  if (!prompt) {
    throw new HttpsError(
      "invalid-argument",
      `未対応の promptType です: ${promptType}`,
    );
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const userContent = context ?
    `context:\n${context}\n\nmessage:\n${message}` :
    message;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {role: "system", content: prompt.systemPrompt},
        {role: "user", content: userContent},
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new HttpsError(
      "internal",
      `OpenAI API error (${response.status}): ${errorBody}`,
    );
  }

  const json = await response.json() as OpenAIResponsesApiOutput;
  const reply = json.output_text?.trim();
  if (!reply) {
    throw new HttpsError("internal", "OpenAI API から応答を取得できませんでした。");
  }

  return reply;
}

export const generateAiReply = onCall(
  {region: "asia-northeast1"},
  async (request) => {
    const data = request.data as GenerateAiReplyRequest | undefined;
    const message = data?.message?.trim();
    const promptType = data?.promptType;

    if (!message || !promptType) {
      throw new HttpsError(
        "invalid-argument",
        "promptType と message は必須です。",
      );
    }

    const reply = await callOpenAi({
      promptType,
      message,
      context: data?.context,
    });

    return {reply};
  },
);

// Backward compatible wrapper for old caller path.
export const generatePassionReply = onCall(
  {region: "asia-northeast1"},
  async (request) => {
    const data = request.data as
      | {passionId?: string; message?: string}
      | undefined;
    const message = data?.message?.trim();

    if (!message) {
      throw new HttpsError("invalid-argument", "message は必須です。");
    }

    const reply = await callOpenAi({
      promptType: "character_making",
      message,
      context: data?.passionId ? `passionId: ${data.passionId}` : undefined,
    });

    return {reply};
  },
);
