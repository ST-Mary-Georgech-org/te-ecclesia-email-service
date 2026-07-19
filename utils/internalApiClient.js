import crypto from "crypto";
import { HMAC_SECRET_KEY, INTERNAL_API_BASE_URL } from "../config/env.js";

/**
 * Make an HMAC-secured request to the internal Spring Boot API.
 * @param {string} path - The internal API path, e.g., "/api/v1/internal/whatsapp/verify-token"
 * @param {object} payload - The JSON payload to send
 */
export const callInternalApi = async (path, payload = {}) => {
  if (!INTERNAL_API_BASE_URL) {
    throw new Error("INTERNAL_API_BASE_URL is not configured.");
  }
  if (!HMAC_SECRET_KEY) {
    throw new Error("HMAC_SECRET_KEY is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = JSON.stringify(payload);

  const hmac = crypto.createHmac("sha256", HMAC_SECRET_KEY);
  hmac.update(timestamp);
  hmac.update(bodyString);
  const signature = hmac.digest("hex");

  const url = `${INTERNAL_API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Timestamp": timestamp,
      },
      body: bodyString,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Internal API call failed: ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error(`Error calling internal API at ${url}:`, error.message);
    throw error;
  }
};
