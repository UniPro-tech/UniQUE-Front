"use server";

import { VerifyCSRFToken } from "@/libs/csrf";
import { FormStatus } from "../Base";
import { Session } from "@/classes/Session";
import { UserData } from "@/classes/types/User";

export const resendEmailVerificationAction = async (
  _userId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    //await _resendEmailVerification(userId);
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
  _prevState: { user: UserData; status: FormStatus | null },
  formData: FormData,
) => {
  try {
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = VerifyCSRFToken(csrfToken);
    if (!isVerified) throw new Error("CSRF token verification failed");
    const displayName = formData.get("display_name") as string;
    const externalEmail = formData.get("external_email") as string;
    const birthdate = formData.get("birthdate") as string;

    const session = await Session.getCurrent();
    const user = await session!.getUser();
    user.profile.displayName = displayName;
    // 生年月日は一度設定したら変更不可
    if (!user.profile.birthdate && birthdate) {
      user.profile.birthdate = birthdate;
    }
    user.externalEmail = externalEmail;
    await user.save();

    return {
      user: user.toJson(),
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
