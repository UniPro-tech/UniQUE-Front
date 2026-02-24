"use server";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { createApiClient } from "@/libs/apiClient";

export const rejectRegistApplyAction = async (
  _prevState: FormStatus | null,
  formData: FormData | null,
): Promise<FormStatus | null> => {
  if (!formData) {
    return { status: "error", message: "不正なフォームデータです。" };
  }
  const userId = formData.get("userId");
  if (!userId || typeof userId !== "string") {
    return { status: "error", message: "userId が指定されていません" };
  }

  try {
    const api = createApiClient();
    const res = await api.post(`/users/${encodeURIComponent(userId)}/reject`);
    if (!res.ok) {
      const text = await res.text();
      console.error("rejectRegistApplyAction failed:", res.status, text);
      return { status: "error", message: `却下に失敗しました: ${res.status}` };
    }
    return { status: "success", message: "申請を却下しました" };
  } catch (err) {
    console.error("rejectRegistApplyAction error:", err);
    return { status: "error", message: "却下中にエラーが発生しました" };
  }
};
