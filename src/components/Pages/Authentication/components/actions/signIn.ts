"use server";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { AuthenticationRequest, type Credentials } from "@/libs/authentication";
import { SetSessionCookie } from "@/libs/cookies";

export const submitSignIn = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string | undefined;
  const remember = formData.get("remember") === "on";
  const code = formData.get("code") as string | undefined;
  const redirectTo = formData.get("redirectTo") as string | undefined;

  const credentials: Credentials = {
    username,
    password,
    code,
    remember,
  };

  const response = await AuthenticationRequest(credentials).catch((error) => {
    const errorCodeMatch = error.message.match(/\[(.*?)\]/);
    const errorCode = errorCodeMatch ? errorCodeMatch[1] : "E0001";
    const queryParams = new URLSearchParams({
      username,
      remember: remember ? "1" : "0",
      error: errorCode,
      ...(redirectTo ? { redirect: redirectTo } : {}),
    });
    redirect(`/signin?${queryParams.toString()}`, RedirectType.replace);
  });

  if (response.requireMfa) {
    const cookieStore = await cookies();
    cookieStore.set("pending_mfa_user", username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60, // 5分間有効
    });

    cookieStore.set("pending_mfa_remember", remember ? "1" : "0", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60, // 5分間有効
    });

    redirect(
      `/signin/mfa?redirect=${encodeURIComponent(redirectTo || "/dashboard")}`,
      RedirectType.replace,
    );
  }

  SetSessionCookie(response);

  redirect(redirectTo ? redirectTo : "/dashboard", RedirectType.push);
};
