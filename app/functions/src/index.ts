export {sendMessage} from "./chat/sendMessage.js";
export {advanceHatchProgress} from "./growth/advanceHatchProgress.js";

import {HttpsError, onCall} from "firebase-functions/v2/https";
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
  error?: {
    message?: string;
  };
  output?: Array<{
    type?: string;
    refusal?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
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

/**
 * Extracts user-displayable reply text from Responses API payload.
 * @param {OpenAIResponsesApiOutput} json OpenAI response payload
 * @return {string} flattened reply/refusal text for UI
 */
function extractReplyText(json: OpenAIResponsesApiOutput): string {
  const fromOutputText = json.output_text?.trim();
  if (fromOutputText) {
    return fromOutputText;
  }

  const chunks = (json.output ?? []).flatMap((item) => {
    const directRefusal = item.refusal?.trim();
    const fromContent = (item.content ?? []).map((part) =>
      (part.text ?? part.refusal ?? "").trim(),
    );
    return [
      ...(directRefusal ? [directRefusal] : []),
      ...fromContent.filter((value) => value.length > 0),
    ];
  });

  return chunks.join("\n").trim();
}

/**
 * Calls OpenAI Responses API with prompt template and user input.
 * @param {GenerateAiReplyRequest} param0 request payload
 * @return {Promise<string>} generated assistant reply text
 */
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
    console.error("OpenAI API request failed", {
      status: response.status,
      body: errorBody,
    });
    throw new HttpsError(
      "internal",
      "AI応答の生成に失敗しました。",
    );
  }

  const json = await response.json() as OpenAIResponsesApiOutput;
  const reply = extractReplyText(json);
  if (!reply) {
    console.error("OpenAI response contained no displayable text", {
      hasOutputText: Boolean(json.output_text),
      outputLength: json.output?.length ?? 0,
      hasError: Boolean(json.error?.message),
    });
    throw new HttpsError("internal", "AI応答の生成に失敗しました。");
  }

  return reply;
}

export const generateAiReply = onCall(
  {region: "asia-northeast1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "認証が必要です。");
    }

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
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "認証が必要です。");
    }

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

export {createUrlExchange} from "./exchange/createUrlExchange";
export {completeExchange} from "./exchange/completeExchange";
export {
  startPassionInterview,
  continuePassionInterview,
  finalizePassionInterview,
} from "./characterMaking/interview";
