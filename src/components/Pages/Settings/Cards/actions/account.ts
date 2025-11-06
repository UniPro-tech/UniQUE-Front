"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { User } from "@/types/User";

export const updateAccountSettings = async (
  prevState: { user: User; message: string },
  formData: FormData
) => {
  // フォームデータから必要な情報を取得して処理を行う
  const csrfToken = formData.get("csrfToken") as string;
  const isVerified = await VerifyCSRFToken(csrfToken);
  if (!isVerified) throw new Error("CSRF token verification failed");
  const displayName = formData.get("display_name") as string;
  const externalEmail = formData.get("external_email") as string;
  const id = formData.get("id") as string;
  console.log("Updating account settings for user ID:", id);

  // ここでデータベースの更新などの処理を行う
  const res = await fetch(`${process.env.RESOURCE_API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      display_name: displayName,
      external_email: externalEmail,
    }),
  });

  const user = toCamelcase(await res.json()) as User;
  console.log("Account settings updated:", user, "status:", res.status);

  // 必要に応じて結果を返す
  return { user, message: "アカウント設定が更新されました。" };
};
