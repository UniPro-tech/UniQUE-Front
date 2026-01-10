"use server";

import { Session } from "@/lib/resources/Session";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { apiGet } from "@/lib/apiClient";

export const getAllSessions = async (uid: string) => {
  const res = await apiGet(`/users/${uid}/sessions`);
  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }
  const sessions = toCamelcase<Session[]>((await res.json()).data);
  return sessions;
};
