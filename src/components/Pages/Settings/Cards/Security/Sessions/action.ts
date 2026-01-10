"use server";

import { VerifyCSRFToken } from "@/lib/CSRF";
import { getSession, Session } from "@/lib/Session";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { FormStatus } from "../../Base";
import { getAllSessions } from "./getter";
import { getAllCookies } from "@/lib/getAllCookie";

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

  const res = await fetch(`${process.env.RESOURCE_API_URL}/sessions/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      cookie: await getAllCookies(),
    },
  });

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
