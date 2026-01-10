"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { getSession, Session } from "@/lib/Session";
import { unauthorized } from "next/navigation";
import { FormStatus } from "../../Base";
import { getAllSessions } from "./getter";
import { apiDelete } from "@/lib/apiClient";

export const logoutSession = async (
  prevState: { sessions: Session[]; status: null | FormStatus },
  formData: FormData
) => {
  const uid = (await getSession())?.user.id;
  if (!uid) {
    unauthorized();
  }
  const csrfToken = formData.get("csrfToken") as string;
  const isVerified = await VerifyCSRFToken(csrfToken);
  if (!isVerified) throw new Error("CSRF token verification failed");
  const id = formData.get("id") as string;
  if (!id) {
    throw new Error("セッションIDがありません。");
  }

  const res = await apiDelete(`/sessions/${id}`);
  if (!res.ok) {
    throw new Error("セッションの削除に失敗しました。");
  }

  const sessions = await getAllSessions(uid);
  const status: FormStatus = {
    status: "success",
    message: "セッションをログアウトしました。",
  };
  return { sessions, status };
};
