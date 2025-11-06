"use server";
import { generateCSRFToken } from "@/lib/CSRF";
import SignInCardClient from "./SignInCardClient";
import { getSession } from "@/lib/Session";
import { redirect, RedirectType } from "next/navigation";

export default async function SignInCard(props: { signUp?: boolean }) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard", RedirectType.replace);
  }
  const csrfToken = generateCSRFToken("expired_" + Date.now().toString());
  return <SignInCardClient signUp={props.signUp} csrfToken={csrfToken} />;
}
