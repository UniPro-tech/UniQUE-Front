"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { FormStatus } from "../Base";
import { resendEmailVerification as _resendEmailVerification } from "@/lib/EmailVerification";
import Session from "@/types/Session";
import type { UserDTO } from "@/types/User";

export const resendEmailVerificationAction = async (
  userId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await _resendEmailVerification(userId);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "認証メールの送信に失敗しました。";
    return { success: false, error: message };
  }
};

export const updateAccountSettings = async (
  _prevState: { user: UserDTO; status: FormStatus | null },
  formData: FormData,
) => {
  try {
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = await VerifyCSRFToken(csrfToken);
    if (!isVerified) throw new Error("CSRF token verification failed");
    const displayName = formData.get("display_name") as string;
    const externalEmail = formData.get("external_email") as string;
    const birthdate = formData.get("birthdate") as string;

    const session = await Session.get();
    const user = session!.user;
    if (!user.profile) {
      user.profile = { userId: user.id, displayName: "" };
    }
    user.profile.displayName = displayName;
    // 生年月日は一度設定したら変更不可
    if (!user.profile.birthdate && birthdate) {
      user.profile.birthdate = birthdate;
    }
    user.externalEmail = externalEmail;
    await user.save();

    return {
      user: user.convertPlain(),
      status: {
        status: "success",
        message: "アカウントが更新されました。",
      } as FormStatus,
    };
  } catch (error) {
    console.error("Account update error:", error);
    return {
      user: _prevState.user,
      status: {
        status: "error",
        message: "アカウントの更新に失敗しました。",
      } as FormStatus,
    };
  }
};
