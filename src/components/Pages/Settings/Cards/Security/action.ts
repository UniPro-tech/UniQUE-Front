"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { FormStatus } from "../Base";

export const updateSettings = async (
  _prevState: null | FormStatus,
  formData: FormData
) => {
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
    return {
      status: "error",
      message: "新しいパスワードと確認欄が一致しません。",
    } as FormStatus;
  }

  // ここでデータベースの更新などの処理を行う
  const res = await fetch(
    `${process.env.RESOURCE_API_URL}/users/${id}/password/change`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }
  );

  if (!res.ok) {
    console.log("Failed to update password:", res.status, res.statusText);
    // const errorData = await res.json();
    if (res.status == 401) {
      return {
        status: "error",
        message: "パスワードが違います。",
      } as FormStatus;
    }
    return {
      status: "error",
      message: "フォームの更新に失敗しました。",
    } as FormStatus;
  }

  // 必要に応じて結果を返す
  return {
    status: "success",
    message: "アカウントが更新されました。",
  } as FormStatus;
};
