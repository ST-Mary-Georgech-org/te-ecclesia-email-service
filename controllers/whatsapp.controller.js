import crypto from "crypto";
import {
  WHATSAPP_BUSINESS_NUMBER,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_APP_SECRET,
  WHATSAPP_VERIFY_TOKEN,
} from "../config/env.js";
import { callInternalApi } from "../utils/internalApiClient.js";

const sendToMeta = async (to, text) => {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_BUSINESS_NUMBER) {
    throw new Error("WhatsApp access token or business number is not configured.");
  }

  const url = `https://graph.facebook.com/v25.0/${WHATSAPP_BUSINESS_NUMBER}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: { body: text },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

export const sendWhatsAppMessage = async (req, res, next) => {
  try {
    const { to, text } = req.body ?? {};
    if (!to || !text) {
      return res.status(400).json({ code: 400, message: "to and text are required." });
    }

    const data = await sendToMeta(to, text);
    return res.status(200).json({ status: "sent", data });
  } catch (error) {
    return next(error);
  }
};

export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};

const verifyWebhookSignature = (req) => {
  if (!WHATSAPP_APP_SECRET) return true; // skip if not configured

  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const expectedSignature = signature.replace("sha256=", "");
  const hmac = crypto.createHmac("sha256", WHATSAPP_APP_SECRET);
  if (req.rawBody) {
    hmac.update(req.rawBody);
  }
  const actualSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(actualSignature));
};

export const handleWebhook = async (req, res, next) => {
  try {
    // 1. Verify signature
    if (!verifyWebhookSignature(req)) {
      return res.sendStatus(403);
    }

    const body = req.body;
    if (body.object !== "whatsapp_business_account") {
      return res.sendStatus(404);
    }

    // Always respond 200 OK immediately per Meta requirements
    res.sendStatus(200);

    // 2. Parse payload
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const fromNumber = message.from;
      
      let messageBody = "";
      if (message.type === "text") {
        messageBody = message.text.body;
      }

      if (!messageBody) return;

      // Check for AUTH_ token
      const tokenMatch = messageBody.match(/AUTH_[A-Z0-9]{8}/);
      if (tokenMatch) {
        const token = tokenMatch[0];

        // 3. Call Spring internal API to verify token
        try {
          const springResponse = await callInternalApi("/api/v1/internal/whatsapp/verify-token", {
            token: token,
            fromNumber: fromNumber,
          });

          // 4. Send bilingual response back based on Spring's validation status
          if (springResponse && springResponse.message) {
            await sendToMeta(fromNumber, springResponse.message);
          }
        } catch (error) {
          console.error("Failed to verify token with Spring backend:", error.message);
          await sendToMeta(fromNumber, "An error occurred during verification. Please try again later. / حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى لاحقًا.");
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};
