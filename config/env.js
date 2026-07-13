import { config } from "dotenv";

config({ path: ".env" });

export const {
  PORT,
  NODE_ENV,
  API_URL,
  API_DESCRIPTION,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  HMAC_SECRET_KEY,
} = process.env;
