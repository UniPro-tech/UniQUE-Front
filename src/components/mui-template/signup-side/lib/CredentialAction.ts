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
        `Sign-up failed: ${res.status} ${res.statusText} - ${await res.text()}`
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

export async function applyCompleteAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const birthday = formData.get("birthdate") as string;
  const csrfToken = formData.get("csrfToken") as string;
  const code = formData.get("code") as string;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw CSRFError;
    }
    console.log("Sign-up data:", { userId, birthday });
    const res = await fetch(`${process.env.RESOURCE_API_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birthdate: birthday,
        email_verified: true,
      }),
    });
    if (!res.ok) {
      throw new Error(
        `Sign-up failed: ${res.status} ${res.statusText} - ${res}`
      );
    }
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }
  try {
    const res = await fetch(
      `${process.env.RESOURCE_API_URL}/email_verify/${encodeURIComponent(
        code || ""
      )}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(
        `Delete email verify code failed: ${res.status} ${res.statusText} - ${res}`
      );
    }
  } catch (error) {
    console.error("Post sign-up error:", error);
    throw error;
  }

  // 成功時のリダイレクト
  redirect("/signup?completed=true", RedirectType.push);
}

export async function migrateAction(formData: FormData) {
  const name = formData.get("name") as string;
  const custom_id = formData.get("username") as string;
  const external_email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const period = formData.get("period") as string;
  const csrfToken = formData.get("csrfToken") as string;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw CSRFError;
    }
    const internalEmail = `${
      period ? `${period.toUpperCase()}.` : ""
    }${custom_id}@uniproject.jp`;
    const verifyRes = await fetch(
      `${process.env.GAS_MIGRATE_API_URL}?external_email=${encodeURIComponent(
        external_email
      )}&internal_email=${encodeURIComponent(internalEmail)}`,
      {
        method: "GET",
      }
    );
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      throw new Error(
        `Migrate failed: ${verifyRes.status} ${
          verifyRes.statusText
        } - ${await verifyRes.text()}`
      );
    } else if (verifyData.status != "200") {
      console.log("Migrate verify failed:", verifyData);
      throw new Error(
        `メンバー情報に誤りがあります。再度ご確認の上、正しい情報を入力してください。`
      );
    }
    const joinedAt = new Date(verifyData.joined_at);
    const res = await fetch(`${process.env.RESOURCE_API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        custom_id,
        external_email,
        email: internalEmail,
        email_verified: false,
        password,
        is_enable: true,
        period: period.toLowerCase(),
        joined_at: joinedAt.toISOString().replace(/\.\d{3}Z$/, ""),
      }),
    });
    if (!res.ok) {
      throw new Error(
        `Migrate failed: ${res.status} ${res.statusText} - ${await res.text()}`
      );
    }
    const resData = await res.json();
    console.log("Migrate success:", resData);
  } catch (error) {
    console.error("Migrate error:", error);
    throw error;
  }

  // 成功時のリダイレクト
  redirect("/signin?migrated=true", RedirectType.push);
}
