"use server";

import { redirect } from "next/navigation";
import Session from "@/types/Session";

export async function logoutAction() {
  try {
    await Session.logout();
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    redirect("/signin?signouted=true");
  }
}
