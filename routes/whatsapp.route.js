import { Router } from "express";
import {
  sendWhatsAppMessage,
  verifyWebhook,
  handleWebhook,
} from "../controllers/whatsapp.controller.js";
import { verifyHmac } from "../middlewares/hmac.middleware.js";

const whatsappRouter = Router();

whatsappRouter.post("/send", verifyHmac, sendWhatsAppMessage);

whatsappRouter.get("/webhook", verifyWebhook);
whatsappRouter.post("/webhook", handleWebhook);

export default whatsappRouter;
