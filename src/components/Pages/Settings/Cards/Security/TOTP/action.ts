"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { createApiClient } from "@/lib/apiClient";
import Session from "@/types/Session";
// use global fetch available in the runtime

export const generateTOTP = async (_prevState: null, formData: FormData) => {
  try {
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = await VerifyCSRFToken(csrfToken);
    if (!isVerified) throw new Error("CSRF token mismatch");

    const password = formData.get("password") as string;

    const session = await Session.get();
    if (!session) throw new Error("session not found");
    const userId = session.userId;

    const authApiUrl = process.env.AUTH_API_URL || "";
    const authClient = createApiClient(authApiUrl);

    const res = await authClient.post(
      `/internal/totp/${encodeURIComponent(userId)}`,
      {
        password,
        user_id: userId,
      },
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "failed to generate totp");
    }

    const json = await res.json();
    return { secret: json.secret, uri: json.uri };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const verifyTOTP = async (_prevState: null, formData: FormData) => {
  try {
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = await VerifyCSRFToken(csrfToken);
    if (!isVerified) throw new Error("CSRF token mismatch");

    const code = formData.get("code") as string;

    const session = await Session.get();
    if (!session) throw new Error("session not found");
    const userId = session.userId;

    const authApiUrl = process.env.AUTH_API_URL || "";
    const authClient = createApiClient(authApiUrl);

    const res = await authClient.post(
      `/internal/totp/${encodeURIComponent(userId)}/verify`,
      { code },
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "failed to verify totp");
    }
    const json = await res.json();
    return { valid: json.valid };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const disableTOTP = async (_prevState: null, formData: FormData) => {
  try {
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = await VerifyCSRFToken(csrfToken);
    if (!isVerified) throw new Error("CSRF token mismatch");

    const password = formData.get("password") as string;

    const session = await Session.get();
    if (!session) throw new Error("session not found");
    const userId = session.userId;

    const authApiUrl = process.env.AUTH_API_URL || "";
    const authClient = createApiClient(authApiUrl);

    const res = await authClient.delete(
      `/internal/totp/${encodeURIComponent(userId)}`,
      { body: JSON.stringify({ password }) },
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "failed to disable totp");
    }

    const json = await res.json();
    return { success: true, message: json.message };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
