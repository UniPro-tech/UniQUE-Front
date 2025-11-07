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
    const errorData = await res.json();
    throw new Error(
      `Failed to update password: ${errorData.message || res.statusText}`
    );
  }

  // 必要に応じて結果を返す
  return "アカウントが更新されました。";
};
