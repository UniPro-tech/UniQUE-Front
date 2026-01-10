"use server";

import { getAllCookies } from "@/lib/getAllCookie";
import { Session } from "@/lib/Session";
import { toCamelcase } from "@/lib/SnakeCamlUtil";

export const getAllSessions = async (uid: string) => {
  const res = await fetch(
    `${process.env.RESOURCE_API_URL}/users/${uid}/sessions`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        cookie: await getAllCookies(),
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }
  const sessions = toCamelcase<Session[]>((await res.json()).data);
  return sessions;
};
