import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { MailConfig } from "@/config";

export async function sendEmail(
  to: string,
  subject: string,
  message: string,
  html?: string
) {
  // Nodemailerのトランスポートを設定
  const transporter = nodemailer.createTransport({
    host: MailConfig.host,
    port: MailConfig.port,
    secure: MailConfig.secure,
    auth: {
      user: MailConfig.auth.user,
      pass: MailConfig.auth.pass,
    },
  });

  // メールオプションを設定
  let mailOptions = {
    from: `"${MailConfig.fromName}" <${MailConfig.fromEmail}>`, // 送信元の設定
    to: to,
    subject: subject,
    text: message,
    html: html,
    headers: {
      "Message-ID": `<${randomUUID()}@${MailConfig.host}>`,
      "X-Sender": MailConfig.envelopeFrom,
    },
    envelope: {
      from: MailConfig.envelopeFrom,
      to: to,
    },
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
}
