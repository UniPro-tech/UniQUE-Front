import { apiPost } from "@/lib/apiClient";

/** POST /internal/users/email_verify レスポンス */
export interface VerifyEmailResponse {
  valid: boolean;
  type: "signup" | "change" | "migration";
}

/** POST /internal/users/email_verify エラーレスポンス */
export interface VerifyEmailError {
  valid: false;
  type: null;
  error: string;
}

/**
 * メール認証コードを検証する
 * POST /internal/users/email_verify { code }
 */
export const verifyEmailCode = async (
  code: string,
): Promise<VerifyEmailResponse | VerifyEmailError | null> => {
  const apiRes = await apiPost(`/internal/users/email_verify`, { code });
  if (!apiRes.ok) {
    if (apiRes.status === 400 || apiRes.status === 404) {
      try {
        const errorData = await apiRes.json();
        if (errorData.error) {
          return {
            valid: false,
            type: null,
            error: errorData.error,
          } as VerifyEmailError;
        }
      } catch {
        // JSONパースに失敗した場合はnullを返す
        return null;
      }
      return null;
    }
    throw new Error(
      `Email verification failed: ${apiRes.status} ${apiRes.statusText}`,
    );
  }
  const data = await apiRes.json();
  console.log(data);
  return data as VerifyEmailResponse;
};

/**
 * メール認証メールを再送する
 * POST /users/{userId}/resend_email_verification
 */
export const resendEmailVerification = async (
  userId: string,
): Promise<boolean> => {
  const apiRes = await apiPost(`/users/${userId}/resend_email_verification`);
  if (!apiRes.ok) {
    if (apiRes.status === 400) {
      const data = await apiRes.json();
      throw new Error(data.error || "Bad request");
    }
    throw new Error(
      `Resend verification failed: ${apiRes.status} ${apiRes.statusText}`,
    );
  }
  return true;
};
