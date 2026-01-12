"use server";

import { authenticationRequest } from "@/lib/Authentication";
import { createSession } from "@/lib/resources/Session";
import { redirect, RedirectType } from "next/navigation";
import { headers } from "next/headers";
import { VerifyCSRFToken } from "@/lib/CSRF";
import { generateMailVerificationTemplate } from "./template/mailVerification";
import { sendEmail } from "@/lib/mailManager";
import { generateVerificationCode } from "@/lib/EmailVerification";
import { apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
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

export async function signInAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const csrfToken = formData.get("csrfToken") as string;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw FormRequestErrors.CSRFTokenMismatch;
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip = await getRealIPAddress();

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
    switch (error) {
      case FormRequestErrors.CSRFTokenMismatch:
        redirect(
          `/signin?error=${FormRequestErrorCodes.CSRFTokenMismatch}`,
          RedirectType.push
        );
      case AuthenticationErrors.MissingCredentials:
        redirect(
          `/signin?error=${AuthenticationErrorCodes.MissingCredentials}`,
          RedirectType.push
        );
      case AuthenticationErrors.InvalidCredentials:
        redirect(
          `/signin?error=${AuthenticationErrorCodes.InvalidCredentials}`,
          RedirectType.push
        );
      case AuthenticationErrors.AccountLocked:
        redirect(
          `/signin?error=${AuthenticationErrorCodes.AccountLocked}`,
          RedirectType.push
        );
      case FrontendErrors.InvalidInput:
        redirect(
          `/signin?error=${FrontendErrorCodes.InvalidInput}`,
          RedirectType.push
        );
      default:
        redirect(
          `/signin?error=${FrontendErrorCodes.UnhandledException}`,
          RedirectType.push
        );
    }
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
      throw FormRequestErrors.CSRFTokenMismatch;
    }
    const res = await apiPost(`/users`, {
      name,
      custom_id,
      external_email,
      password,
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw AuthorizationErrors.Unauthorized;
      } else {
        throw ResourceApiErrors.ResourceCreationFailed;
      }
    }
    const resData = await res.json();
    uid = resData.id;
  } catch (error) {
    throw error;
  }
  try {
    const verificationCode = await generateVerificationCode(uid);
    const template = await generateMailVerificationTemplate(verificationCode);
    await sendEmail(
      external_email,
      "【UniQUE】仮登録完了 メールアドレス認証",
      template.text,
      template.html
    );
  } catch (error) {
    // TODO: Logging
    switch (error) {
      case FormRequestErrors.CSRFTokenMismatch:
        redirect(
          `/signup?error=${FormRequestErrorCodes.CSRFTokenMismatch}`,
          RedirectType.push
        );
      case AuthorizationErrors.Unauthorized:
        redirect(
          `/signup?error=${AuthorizationErrorCodes.Unauthorized}`,
          RedirectType.push
        );
      default:
        redirect(
          `/signup?error=${FrontendErrorCodes.UnhandledException}`,
          RedirectType.push
        );
    }
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
      throw FormRequestErrors.CSRFTokenMismatch;
    }
    const res = await apiPatch(`/users/${userId}`, {
      birthdate: birthday,
      email_verified: true,
    });
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
          `/signup?code=${encodeURIComponent(code || "")}&error=${
            AuthorizationErrorCodes.Unauthorized
          }`,
          RedirectType.push
        );
      default:
        redirect(
          `/signup?code=${encodeURIComponent(code || "")}&error=${
            FrontendErrorCodes.UnhandledException
          }`,
          RedirectType.push
        );
    }
  }
  try {
    const res = await apiDelete(
      `/email_verify/${encodeURIComponent(code || "")}`
    );
    if (!res.ok) {
      if (res.status === 401) {
        throw AuthorizationErrors.Unauthorized;
      } else {
        throw ResourceApiErrors.ResourceDeletionFailed;
      }
    }
  } catch (error) {
    switch (error) {
      case AuthorizationErrors.Unauthorized:
        redirect(
          `/signup?code=${encodeURIComponent(code || "")}&error=${
            AuthorizationErrorCodes.Unauthorized
          }`,
          RedirectType.push
        );
      default:
        redirect(
          `/signup?code=${encodeURIComponent(code || "")}&error=${
            FrontendErrorCodes.UnhandledException
          }`,
          RedirectType.push
        );
    }
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
      throw FormRequestErrors.CSRFTokenMismatch;
    }
    const internalEmail = `${
      period && period != "00" && period != "0"
        ? `${period.toUpperCase()}.`
        : ""
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
      // TODO: Logging
      throw AuthenticationErrors.MigrationError;
    }
    const joinedAt = new Date(verifyData.joined_at);
    const res = await apiPost(`/users`, {
      name,
      custom_id,
      external_email,
      email: internalEmail.toLowerCase(),
      email_verified: false,
      password,
      is_enable: true,
      period: period.toLowerCase(),
      joined_at: joinedAt.toISOString().replace(/\.\d{3}Z$/, ""),
    });
    if (!res.ok) {
      // TODO: Logging
      throw AuthenticationErrors.MigrationError;
    }
    await res.json();
  } catch (error) {
    // TODO: Logging
    switch (error) {
      case FormRequestErrors.CSRFTokenMismatch:
        redirect(
          `/migrate?error=${FormRequestErrorCodes.CSRFTokenMismatch}`,
          RedirectType.push
        );
      case AuthenticationErrors.MigrationError:
        redirect(
          `/migrate?error=${AuthenticationErrorCodes.MigrationError}`,
          RedirectType.push
        );
      default:
        console.log("Migrate error:", error);
        redirect(
          `/migrate?error=${FrontendErrorCodes.UnhandledException}`,
          RedirectType.push
        );
    }
  }

  // 成功時のリダイレクト
  redirect("/signin?migrated=true", RedirectType.push);
}
