import { FormStatus } from "@/components/Pages/Settings/Cards/Base";

export const approveRegistApplyAction = async (
  _prevState: FormStatus | null,
  formData: FormData | null
): Promise<FormStatus | null> => {
  if (!formData) {
    return {
      status: "error",
      message: "不正なフォームデータです。",
    };
  }
  const userId = formData.get("userId") as string;
  const period = formData.get("period") as string;
  const mailboxPassword = formData.get("mailboxPassword") as string;

  try {
    const response = await fetch(`/api/admin/approveRegistApply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, period }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: "error",
        message: errorData.message || "メンバーの承認に失敗しました。",
      };
    }

    return {
      status: "success",
      message: "メンバーを承認しました。",
    };
  } catch (error) {
    return {
      status: "error",
      message: "メンバーの承認中にエラーが発生しました。",
    };
  }
};
