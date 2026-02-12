"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import Session from "@/types/Session";
import { FormRequestErrors } from "@/types/Errors/FormRequestErrors";
import { FrontendErrors } from "@/types/Errors/FrontendErrors";
import type { FormStatus } from "@/components/Pages/Settings/Cards/Base";

export const updateBirthdate = async (
  prevState: { birthdate: string; status: FormStatus | null },
  formData: FormData,
): Promise<{ birthdate: string; status: FormStatus | null }> => {
  try {
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = VerifyCSRFToken(csrfToken);
    if (!isVerified) throw FormRequestErrors.CSRFTokenMismatch;

    const birthdate = formData.get("birthdate") as string;
    if (!birthdate) throw FrontendErrors.InvalidInput;

    const session = await Session.get();
    if (!session) {
      return {
        birthdate: prevState.birthdate,
        status: {
          status: "error",
          message: "セッションが見つかりません。",
        },
      };
    }

    const user = session.user;
    if (!user.profile) {
      user.profile = { userId: user.id, displayName: user.displayName };
    }
    user.profile.birthdate = birthdate;
    await user.save();

    return {
      birthdate,
      status: {
        status: "success",
        message: "生年月日を設定しました。",
      },
    };
  } catch (error) {
    return {
      birthdate: prevState.birthdate,
      status: {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "生年月日の設定に失敗しました。",
      },
    };
  }
};
