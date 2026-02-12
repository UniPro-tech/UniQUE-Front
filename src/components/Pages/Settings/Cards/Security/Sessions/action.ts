"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { FormStatus } from "../../Base";
import Session, { type AuthSessionDTO } from "@/types/Session";
import { FormRequestErrors } from "@/types/Errors/FormRequestErrors";
import { FrontendErrors } from "@/types/Errors/FrontendErrors";

export interface ExtendedAuthSessionDTO extends AuthSessionDTO {
  isDeleted?: boolean;
}

export const logoutSession = async (
  prevState: { sessions: ExtendedAuthSessionDTO[]; status: FormStatus | null },
  formData: FormData,
): Promise<{ sessions: ExtendedAuthSessionDTO[]; status: FormStatus }> => {
  try {
    const session = await Session.get();
    if (!session) {
      return {
        sessions: prevState.sessions,
        status: {
          status: "error",
          message: "セッションが見つかりません。",
        },
      };
    }
    const csrfToken = formData.get("csrfToken") as string;
    const isVerified = VerifyCSRFToken(csrfToken);
    if (!isVerified) throw FormRequestErrors.CSRFTokenMismatch;

    const sessionId = formData.get("sessionId") as string;
    if (!sessionId) {
      throw FrontendErrors.InvalidInput;
    }

    // 個別のセッションを削除
    const deleted = await Session.deleteById(sessionId);
    if (!deleted) {
      return {
        sessions: prevState.sessions,
        status: {
          status: "error",
          message: "セッションの削除に失敗しました。",
        },
      };
    }

    // 現在のセッションを削除した場合は Cookie も削除
    // session.sessionId が取得できればそれで判定、できなければ lastLoginAt で判定
    let isCurrentSession = false;
    if (session.sessionId) {
      isCurrentSession = sessionId === session.sessionId;
    } else {
      // lastLoginAt が最新のセッションを現在のセッションとみなす
      const sorted = [...prevState.sessions].sort(
        (a, b) =>
          new Date(b.lastLoginAt || b.updatedAt).getTime() -
          new Date(a.lastLoginAt || a.updatedAt).getTime(),
      );
      isCurrentSession = sorted.length > 0 && sorted[0].id === sessionId;
    }

    if (isCurrentSession) {
      await Session.logout();
    }

    // セッションに削除済みフラグを付ける（削除せずにマークする）
    const updatedSessions = prevState.sessions.map((s) =>
      s.id === sessionId ? { ...s, isDeleted: true } : s,
    );

    const status: FormStatus = {
      status: "success",
      message: isCurrentSession
        ? "ログアウトしました。ページをリロードしてください。"
        : "セッションをログアウトしました。",
    };
    return { sessions: updatedSessions, status };
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
