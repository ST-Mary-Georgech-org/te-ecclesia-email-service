import { Router } from "express";
import { sendEmail } from "../controllers/email.controller.js";
import { verifyHmac } from "../middlewares/hmac.middleware.js";

const emailRouter = Router();

/**
 * @swagger
 * /api/v1/send-email:
 *   post:
 *     summary: Send an email through Gmail SMTP
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
emailRouter.post("/send-email", verifyHmac, sendEmail);

export default emailRouter;
