import nodemailer from "nodemailer";
import { MAIL_PASSWORD, MAIL_USERNAME } from "../config/env.js";
import { enqueueEmail } from "../utils/emailQueue.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
});

export const sendEmail = async (req, res, next) => {
  try {
    const { email, subject, message } = req.body ?? {};

    if (!email || !subject || !message) {
      return res.status(400).json({
        code: 400,
        message: "email, subject, and message are required.",
      });
    }

    if (!MAIL_USERNAME || !MAIL_PASSWORD) {
      return res.status(500).json({
        code: 500,
        message: "MAIL_USERNAME or MAIL_PASSWORD is not configured.",
      });
    }

    const sendResult = await enqueueEmail(() =>
      transporter.sendMail({
        from: MAIL_USERNAME,
        to: email,
        subject,
        text: message,
      }),
    );

    return res.status(200).json({
      status: "sent",
      messageId: sendResult.messageId,
    });
  } catch (error) {
    return next(error);
  }
};
