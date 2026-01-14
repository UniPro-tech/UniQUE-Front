"use server";
import { generateCSRFToken } from "@/lib/CSRF";
import SignInCardClient from "./SignInCardClient";
import { redirect, RedirectType } from "next/navigation";
import { SignInCardMode } from "../types/SignInCardMode";
import { User } from "@/types/User";
import Session from "@/types/Session";

export default async function SignInCard({
  mode = SignInCardMode.SignIn,
  user,
  code,
}: {
  mode?: SignInCardMode;
  user?: User;
  code?: string;
}) {
  const session = await Session.get();
  if (session) {
    redirect("/dashboard", RedirectType.replace);
  }
  const csrfToken = generateCSRFToken("csrf_protect");
  return (
    <SignInCardClient
      mode={mode}
      csrfToken={csrfToken}
      user={user}
      code={code}
    />
  );
}
