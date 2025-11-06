"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";

export const updateSettings = async (prevState: string, formData: FormData) => {
  // フォームデータから必要な情報を取得して処理を行う
  const csrfToken = formData.get("csrfToken") as string;
  const isVerified = await VerifyCSRFToken(csrfToken);
  if (!isVerified) throw new Error("CSRF token verification failed");
  const id = formData.get("id") as string;
  console.log("Updating account settings for user ID:", id);
  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmNewPassword = formData.get("confirm_new_password") as string;

  if (newPassword !== confirmNewPassword) {
    throw new Error("New password and confirmation do not match.");
  }

  // ここでデータベースの更新などの処理を行う
  // TODO: 実際の更新ロジックを実装する

  // const user = toCamelcase(await res.json());
  // console.log("Account settings updated:", user, "status:", res.status);

  // 必要に応じて結果を返す
  return "アカウントが更新されました。";
};
