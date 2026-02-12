import { expect, test } from "bun:test";

import { sendEmail } from "@/lib/mailManager";

import { toEmail } from "./config";

test("sendEmail sends an text email without throwing", async () => {
  await expect(
    sendEmail(toEmail, "Test Subject", "This is a test email message."),
  ).resolves.toBeUndefined();
});

test("sendEmail sends an HTML email without throwing", async () => {
  await expect(
    sendEmail(
      toEmail,
      "Test Subject",
      "This is a test email message.",
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          header {
            background-color: #0088FFFF;
            color: white;
            padding: 10px;
            text-align: center;
          }
          main {
            margin: 20px;
            font-family: Arial, sans-serif;
          }
          footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px;
            position: fixed;
            width: 100%;
            bottom: 0;
          }
          h1 {
            font-size: 24px;
          }
          h2 {
            font-size: 20px;
          }
          p {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>UniQUE</h1>
        </header>
        <main>
          <h2>Welcome to UniQUE!</h2>
          <p>Thank you for joining our platform. We're excited to have you on board.</p>
        </main>
        <footer>
          <span>&copy; 2024 UniQUE. All rights reserved.</span>
        </footer>
      </body>
      </html>`,
    ),
  ).resolves.toBeUndefined();
});
