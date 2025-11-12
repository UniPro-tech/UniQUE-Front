"use server";

import { authenticationRequest } from "@/lib/Authentication";
import { createSession } from "@/lib/Session";
import { redirect, RedirectType } from "next/navigation";
import { headers } from "next/headers";
import { VerifyCSRFToken } from "@/lib/CSRF";
import { CSRFError } from "@/lib/RequestErrors";
import { generateMailVerificationTemplate } from "./template/mailVerification";
import { sendEmail } from "@/lib/mail";
import { generateVerificationCode } from "@/lib/EmailVerification";

export async function signInAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const csrfToken = formData.get("csrfToken") as string;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw CSRFError;
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "";

    const data = await authenticationRequest({
      username,
      password,
      ip: ip,
      user_agent: userAgent,
      remember_me: remember,
    });

    // セッションCookieをセット
    await createSession(data.session_id, new Date(data.expires));
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error; // エラーを再スロー
  }

  // 成功時のリダイレクト
  redirect("/dashboard", RedirectType.push);
}

export async function signUpAction(formData: FormData) {
  const name = formData.get("name") as string;
  const custom_id = formData.get("username") as string;
  const external_email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const csrfToken = formData.get("csrfToken") as string;
  let uid;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw CSRFError;
    }
    console.log("Sign-up data:", { name, custom_id, external_email, password });
    const res = await fetch(`${process.env.RESOURCE_API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        custom_id,
        external_email,
        password,
      }),
    });
    if (!res.ok) {
      throw new Error(
        `Sign-up failed: ${res.status} ${res.statusText} - ${res}`
      );
    }
    const resData = await res.json();
    uid = resData.id;
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }
  try {
    const verificationCode = await generateVerificationCode(uid);
    const template = await generateMailVerificationTemplate(verificationCode);
    const res = await sendEmail(
      external_email,
      "【UniQUE】仮登録完了 メールアドレス認証",
      template.text,
      template.html
    );
    console.log("Email sent info:", res);
  } catch (error) {
    console.error("Post sign-up error:", error);
    throw error;
  }

  // 成功時のリダイレクト
  redirect("/signin?mail=sended", RedirectType.push);
}
