"use server";
import { generateCSRFToken } from "@/lib/CSRF";
import SignInCardClient from "./SignInCardClient";
import Session from "@/types/Session";
import { redirect, RedirectType } from "next/navigation";
import { SignInCardMode } from "../types/SignInCardMode";
import User from "@/types/User";

export default async function SignInCard({
  mode = SignInCardMode.SignIn,
  user,
  code,
  redirect: redirectParam,
  initialFormValues,
}: {
  mode?: SignInCardMode;
  user?: User;
  code?: string;
  redirect?: string;
  initialFormValues?: {
    name?: string;
    email?: string;
    period?: string;
    username?: string;
  };
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
      redirect={redirectParam}
      initialFormValues={initialFormValues}
    />
  );
}
