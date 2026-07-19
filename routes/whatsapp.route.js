import { Router } from "express";
import {
  sendWhatsAppMessage,
  verifyWebhook,
  handleWebhook,
} from "../controllers/whatsapp.controller.js";
import { verifyHmac } from "../middlewares/hmac.middleware.js";

const whatsappRouter = Router();

/**
 * @swagger
 * /api/v1/whatsapp/send:
 *   post:
 *     summary: Send a WhatsApp message through Meta Graph API
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - text
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient's phone number
 *               text:
 *                 type: string
 *                 description: Message text
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (HMAC signature invalid)
 *       500:
 *         description: Internal server error or Meta API error
 */
whatsappRouter.post("/send", verifyHmac, sendWhatsAppMessage);

/**
 * @swagger
 * /api/v1/whatsapp/webhook:
 *   get:
 *     summary: Verify webhook challenge from Meta
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Webhook verified successfully
 *       403:
 *         description: Webhook verification failed
 */
whatsappRouter.get("/webhook", verifyWebhook);

/**
 * @swagger
 * /api/v1/whatsapp/webhook:
 *   post:
 *     summary: Receive WhatsApp messages from Meta
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: header
 *         name: X-Hub-Signature-256
 *         schema:
 *           type: string
 *         required: false
 *         description: Meta webhook signature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook payload from Meta
 *     responses:
 *       200:
 *         description: Webhook processed
 *       403:
 *         description: Invalid signature
 *       404:
 *         description: Invalid object type
 */
whatsappRouter.post("/webhook", handleWebhook);

export default whatsappRouter;
