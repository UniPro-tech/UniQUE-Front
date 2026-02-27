"use server";

import { Session } from "@/classes/Session";
import { redirect } from "next/navigation";

export async function logoutAction() {
  try {
    (await Session.getCurrent())?.delete();
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    redirect("/signin?signouted=true");
  }
}
