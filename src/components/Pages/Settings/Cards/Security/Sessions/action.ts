"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { unauthorized } from "next/navigation";
import { FormStatus } from "../../Base";
import Session, { SessionPlain } from "@/types/Session";
import { FormRequestErrors } from "@/types/Errors/FormRequestErrors";
import { FrontendErrors } from "@/types/Errors/FrontendErrors";

export const logoutSession = async (
  prevState: { sessions: SessionPlain[]; status: FormStatus | null },
  formData: FormData
): Promise<{ sessions: SessionPlain[]; status: FormStatus }> => {
  try {
    const uid = (await Session.get())?.user.id;
    if (!uid) {
      unauthorized();
    }
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = VerifyCSRFToken(csrfToken);
    if (!isVerified) throw FormRequestErrors.CSRFTokenMismatch;
    const id = formData.get("id") as string;
    if (!id) {
      throw FrontendErrors.InvalidInput;
    }

    if (prevState.sessions.find((s) => s.id === id) === undefined) {
      throw FrontendErrors.InvalidInput;
    }
    const targetSession = new Session(
      prevState.sessions.find((s) => s.id === id)!
    );
    targetSession.delete();

    const sessions = await Session.list({ asPlain: true });
    const status: FormStatus = {
      status: "success",
      message: "セッションをログアウトしました。",
    };
    return { sessions, status };
  } catch (error) {
    const sessions = prevState.sessions;
    const status: FormStatus = {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "セッションのログアウト中に予期せぬエラーが発生しました。",
    };
    return { sessions, status };
  }
};
