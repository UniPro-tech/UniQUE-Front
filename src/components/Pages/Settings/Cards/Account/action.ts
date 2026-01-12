"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { FormStatus } from "../Base";
import Session from "@/types/Session";
import User from "@/types/User";

export const updateAccountSettings = async (
  _prevState: { user: User; status: FormStatus | null },
  formData: FormData
) => {
  try {
    // フォームデータから必要な情報を取得して処理を行う
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = await VerifyCSRFToken(csrfToken);
    if (!isVerified) throw new Error("CSRF token verification failed");
    const displayName = formData.get("display_name") as string;
    const externalEmail = formData.get("external_email") as string;

    const session = await Session.get();
    const user = session!.user;
    user.name = displayName;
    user.externalEmail = externalEmail;
    await user.save();

    // 必要に応じて結果を返す
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
