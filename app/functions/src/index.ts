import {initializeApp} from "firebase-admin/app";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

type GeneratePassionReplyRequest = {
  passionId: string;
  message: string;
};

export const generatePassionReply = onCall<GeneratePassionReplyRequest>(
  (request) => {
    const message = request.data?.message?.trim() ?? "";
    const short =
      message.length > 40 ? `${message.slice(0, 40)}...` : message;

    return {
      reply:
        `「${short || "その話"}」いいですね。` +
        "いつからそれが好きになりましたか？",
    };
  },
);

export {createUrlExchange} from "./exchange/createUrlExchange";
export {completeExchange} from "./exchange/completeExchange";
