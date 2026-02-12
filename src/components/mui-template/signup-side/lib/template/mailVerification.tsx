"use server";
import { headers } from "next/headers";

export async function generateMailVerificationTemplate(
  verificationCode: string,
) {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const mailTemplate = `
    <html>
      <body style='font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; background-color: #f9f9f9; padding: 20px;'>
        <header>
          <h1>UniQUE</h1>
        </header>
        <main>
          <h2>メールアドレス認証</h2>
          <p>以下のURLからメールアドレスの認証を完了してください。</p>
          <a
            href="${baseUrl}/email-verify?code=${verificationCode}"
            style='display: inline-block; padding: 10px 20px; background-color: #1976d2; color: #ffffff; text-decoration: none; border-radius: 4px; margin-top: 10px;'
          >
            メールアドレスを認証する
          </a>
          <p>もしこのメールに心当たりがない場合は、無視してください。</p>
        </main>
        <footer>(c) 2025 UniProject. All rights reserved.</footer>
      </body>
    </html>
  `;

  return {
    html: mailTemplate,
    text:
      "メールアドレスの認証を完了するには、以下のリンクをクリックしてください。\n" +
      `${baseUrl}/email-verify?code=${verificationCode}` +
      "\n\nもしこのメールに心当たりがない場合は、無視してください。" +
      "\n\n(c) 2025 UniProject. All rights reserved.",
  };
}
