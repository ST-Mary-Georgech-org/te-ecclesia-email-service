import crypto from "crypto";
import { HMAC_SECRET_KEY } from "../config/env.js";

export const verifyHmac = (req, res, next) => {
  if (!HMAC_SECRET_KEY) {
    return res.status(500).json({
      code: 500,
      message: "HMAC_SECRET_KEY is not configured.",
    });
  }

  const signature = req.headers["x-signature"];
  const timestamp = req.headers["x-timestamp"];

  if (!signature || !timestamp) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden.",
    });
  }

  const requestTimestamp = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(requestTimestamp) || Math.abs(now - requestTimestamp) > 300) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden.",
    });
  }

  const hmac = crypto.createHmac("sha256", HMAC_SECRET_KEY);
  hmac.update(timestamp);
  if (req.rawBody) {
    hmac.update(req.rawBody);
  }
  const computedSignature = hmac.digest("hex");

  if (computedSignature !== signature) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden.",
    });
  }

  return next();
};
