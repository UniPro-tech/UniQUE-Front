"use server";

import { authenticationRequest } from "@/lib/Authentication";
import Session from "@/types/Session";
import { redirect, RedirectType } from "next/navigation";
import { headers } from "next/headers";
import { VerifyCSRFToken } from "@/lib/CSRF";
import User from "@/types/User";
import {
  FormRequestErrorCodes,
  FormRequestErrors,
} from "@/types/Errors/FormRequestErrors";
import {
  AuthenticationErrorCodes,
  AuthenticationErrors,
} from "@/types/Errors/AuthenticationErrors";
import {
  FrontendErrorCodes,
  FrontendErrors,
} from "@/types/Errors/FrontendErrors";
import { ResourceApiErrors } from "@/types/Errors/ResourceApiErrors";
import {
  AuthorizationErrorCodes,
  AuthorizationErrors,
} from "@/types/Errors/AuthorizationErrors";
import { getRealIPAddress } from "@/lib/UserAgentInfomation";
import { CreateUserRequest } from "@/types/User";

/** JWTペイロードからexpを取り出す簡易関数 */
function getJwtExp(jwt: string): Date {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split(".")[1], "base64").toString("utf-8"),
    );
    return new Date((payload.exp ?? 0) * 1000);
  } catch {
    return new Date(Date.now() + 3600_000); // fallback: 1h
  }
}

export async function signInAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const csrfToken = formData.get("csrfToken") as string;
  const redirectParam = formData.get("redirect") as string | null;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw FormRequestErrors.CSRFTokenMismatch;
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip = await getRealIPAddress();

    const data = await authenticationRequest({
      type: "password",
      username,
      password,
      ip_address: ip,
      user_agent: userAgent,
      remember,
    });

    // JWT Cookie をセット
    const expiresAt = getJwtExp(data.session_jwt);
    await Session.create(data.session_jwt, expiresAt);
  } catch (error) {
    console.error("Sign-in error:", error);
    const redirectQuery = redirectParam
      ? `&redirect=${encodeURIComponent(redirectParam)}`
      : "";
    switch (error) {
      case FormRequestErrors.CSRFTokenMismatch:
        redirect(
          `/signin?error=${FormRequestErrorCodes.CSRFTokenMismatch}${redirectQuery}`,
          RedirectType.push,
        );
        break;
      case AuthenticationErrors.MissingCredentials:
        redirect(
          `/signin?error=${AuthenticationErrorCodes.MissingCredentials}${redirectQuery}`,
          RedirectType.push,
        );
        break;
      case AuthenticationErrors.InvalidCredentials:
        redirect(
          `/signin?error=${AuthenticationErrorCodes.InvalidCredentials}${redirectQuery}`,
          RedirectType.push,
        );
        break;
      case AuthenticationErrors.AccountLocked:
        redirect(
          `/signin?error=${AuthenticationErrorCodes.AccountLocked}${redirectQuery}`,
          RedirectType.push,
        );
        break;
      case FrontendErrors.InvalidInput:
        redirect(
          `/signin?error=${FrontendErrorCodes.InvalidInput}${redirectQuery}`,
          RedirectType.push,
        );
        break;
      default:
        redirect(
          `/signin?error=${FrontendErrorCodes.UnhandledException}${redirectQuery}`,
          RedirectType.push,
        );
    }
  }

  // 成功時のリダイレクト
  if (redirectParam) {
    redirect(redirectParam, RedirectType.push);
  }
  redirect("/dashboard", RedirectType.push);
}

export async function signUpAction(formData: FormData) {
  const displayName = formData.get("name") as string;
  const custom_id = formData.get("username") as string;
  const external_email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const csrfToken = formData.get("csrfToken") as string;
  const redirectParam = formData.get("redirect") as string | null;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw FormRequestErrors.CSRFTokenMismatch;
    }

    // 内部メールアドレスを生成（一時的なメールアドレス）
    const internalEmail = `tmp_${custom_id}@uniproject.jp`;

    const body: CreateUserRequest = {
      custom_id,
      email: internalEmail,
      external_email,
      password,
      status: "established",
      profile: {
        display_name: displayName,
      },
    };

    await User.create(body);

    // メール認証は新APIで自動送信される想定
    // TODO: 必要に応じて /users/{userId}/resend_email_verification を呼ぶ実装を追加
  } catch (error) {
    const redirectQuery = redirectParam
      ? `&redirect=${encodeURIComponent(redirectParam)}`
      : "";
    const formDataQuery = `&name=${encodeURIComponent(displayName)}&username=${encodeURIComponent(custom_id)}&email=${encodeURIComponent(external_email)}`;
    switch (error) {
      case FormRequestErrors.CSRFTokenMismatch:
        redirect(
          `/signup?error=${FormRequestErrorCodes.CSRFTokenMismatch}${redirectQuery}${formDataQuery}`,
          RedirectType.push,
        );
        break;
      case AuthorizationErrors.Unauthorized:
        redirect(
          `/signup?error=${AuthorizationErrorCodes.Unauthorized}${redirectQuery}${formDataQuery}`,
          RedirectType.push,
        );
        break;
      default:
        redirect(
          `/signup?error=${FrontendErrorCodes.UnhandledException}${redirectQuery}${formDataQuery}`,
          RedirectType.push,
        );
    }
  }

  // 成功時のリダイレクト
  const redirectQuery = redirectParam
    ? `&redirect=${encodeURIComponent(redirectParam)}`
    : "";
  redirect(`/signin?mail=sended${redirectQuery}`, RedirectType.push);
}

export async function applyCompleteAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const csrfToken = formData.get("csrfToken") as string;
  const code = formData.get("code") as string;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw FormRequestErrors.CSRFTokenMismatch;
    }

    // PUT /users/{id} でメール認証済み等を更新
    const { apiPut } = await import("@/lib/apiClient");
    const res = await apiPut(
      `/users/${userId}`,
      {
        status: "active",
      },
      {
        headers: {
          "X-Api-Key": process.env.RESOURCE_API_KEY || "",
        },
      },
    );
    if (!res.ok) {
      if (res.status === 401) {
        throw AuthorizationErrors.Unauthorized;
      } else {
        throw ResourceApiErrors.ResourceUpdateFailed;
      }
    }
  } catch (error) {
    switch (error) {
      case AuthorizationErrors.Unauthorized:
        redirect(
          `/signup?code=${encodeURIComponent(code || "")}&error=${AuthorizationErrorCodes.Unauthorized}`,
          RedirectType.push,
        );
        break;
      default:
        redirect(
          `/signup?code=${encodeURIComponent(code || "")}&error=${FrontendErrorCodes.UnhandledException}`,
          RedirectType.push,
        );
    }
  }

  redirect("/signup?completed=true", RedirectType.push);
}

export async function migrateAction(formData: FormData) {
  const displayName = formData.get("name") as string;
  const custom_id = formData.get("username") as string;
  const external_email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const period = formData.get("period") as string;
  const csrfToken = formData.get("csrfToken") as string;
  const redirectParam = formData.get("redirect") as string | null;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw FormRequestErrors.CSRFTokenMismatch;
    }
    const internalEmail = `${
      period && period !== "00" && period !== "0"
        ? `${period.toUpperCase()}.`
        : ""
    }${custom_id}@uniproject.jp`;

    const verifyRes = await fetch(
      `${process.env.GAS_MIGRATE_API_URL}?external_email=${encodeURIComponent(
        external_email,
      )}&internal_email=${encodeURIComponent(internalEmail)}`,
      { method: "GET" },
    );
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || verifyData.status !== 200) {
      throw AuthenticationErrors.MigrationError;
    }

    const joinedAt = new Date(verifyData.joined_at);

    const body: CreateUserRequest = {
      custom_id,
      email: internalEmail.toLowerCase(),
      external_email,
      password,
      status: "active",
      affiliation_period: period,
      profile: {
        display_name: displayName,
        joined_at: joinedAt.toISOString().replace(/\.\d{3}Z$/, "Z"),
      },
    };

    await User.create(body);
  } catch (error) {
    const redirectQuery = redirectParam
      ? `&redirect=${encodeURIComponent(redirectParam)}`
      : "";
    const formDataQuery = `&name=${encodeURIComponent(displayName)}&email=${encodeURIComponent(external_email)}&period=${encodeURIComponent(period)}&username=${encodeURIComponent(custom_id)}`;
    switch (error) {
      case FormRequestErrors.CSRFTokenMismatch:
        redirect(
          `/migrate?error=${FormRequestErrorCodes.CSRFTokenMismatch}${redirectQuery}${formDataQuery}`,
          RedirectType.push,
        );
        break;
      case AuthenticationErrors.MigrationError:
        redirect(
          `/migrate?error=${AuthenticationErrorCodes.MigrationError}${redirectQuery}${formDataQuery}`,
          RedirectType.push,
        );
        break;
      case ResourceApiErrors.ResourceCreationFailed:
        redirect(
          `/migrate?error=${ResourceApiErrors.ResourceCreationFailed}${redirectQuery}${formDataQuery}`,
          RedirectType.push,
        );
        break;
      default:
        console.log("Migrate error:", error);
        redirect(
          `/migrate?error=${FrontendErrorCodes.UnhandledException}${redirectQuery}${formDataQuery}`,
          RedirectType.push,
        );
    }
  }

  const redirectQuery = redirectParam
    ? `&redirect=${encodeURIComponent(redirectParam)}`
    : "";
  redirect(`/signin?migrated=true${redirectQuery}`, RedirectType.push);
}
