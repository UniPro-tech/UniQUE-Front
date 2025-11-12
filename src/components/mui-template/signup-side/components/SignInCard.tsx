"use server";
import { generateCSRFToken } from "@/lib/CSRF";
import SignInCardClient from "./SignInCardClient";
import { getSession } from "@/lib/Session";
import { redirect, RedirectType } from "next/navigation";

export enum SignInCardMode {
  SignIn,
  SignUp,
  SignInEmailValidated,
}

export default async function SignInCard({
  mode = SignInCardMode.SignIn,
}: {
  mode?: SignInCardMode;
}) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard", RedirectType.replace);
  }
  const csrfToken = generateCSRFToken("csrf_protect");
  return <SignInCardClient mode={mode} csrfToken={csrfToken} />;
}
