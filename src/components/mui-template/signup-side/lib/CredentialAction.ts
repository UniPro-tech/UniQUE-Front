"use server";

import { authenticationRequest } from "@/lib/Authentication";
import { createSession } from "@/lib/Session";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { VerifyCSRFToken } from "@/lib/CSRF";
import { CSRFError } from "@/lib/RequestErrors";

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
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const csrfToken = formData.get("csrfToken") as string;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw CSRFError;
    }
    console.log("Sign-up data:", { name, username, email, password });
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }

  // 成功時のリダイレクト
  redirect("/signin");
}
