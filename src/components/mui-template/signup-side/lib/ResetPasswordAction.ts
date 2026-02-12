"use server";

import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { VerifyCSRFToken } from "@/lib/CSRF";
import { PasswordResetRequest } from "@/lib/resources/PasswordReset";
import { FormRequestErrors } from "@/types/Errors/FormRequestErrors";

export async function resetPasswordAction(
  _prevState: FormStatus | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const csrfToken = formData.get("csrfToken") as string;

  try {
    const tokenVerified = VerifyCSRFToken(csrfToken);
    if (!tokenVerified) {
      throw FormRequestErrors.CSRFTokenMismatch;
    }
    await PasswordResetRequest(email);
    return {
      status: "success",
      message: "パスワードリセットのリンクを送信しました。",
    } as FormStatus;
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      status: "error",
      message: "パスワードリセットのリクエスト中にエラーが発生しました。",
    } as FormStatus;
  }
}
