"use server";
import { AuthenticationRequest, Credentials } from "@/libs/authoentication";
import { redirect, RedirectType } from "next/navigation";

export const submitSignIn = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  const credentials: Credentials = {
    username,
    password,
    remember,
  };

  AuthenticationRequest(credentials).catch((error) => {
    const errorCodeMatch = error.message.match(/\[(.*?)\]/);
    const errorCode = errorCodeMatch ? errorCodeMatch[1] : "E0001";
    const queryParams = new URLSearchParams({
      username,
      remember: remember ? "1" : "0",
      error: errorCode,
    });
    redirect(`/signin?${queryParams.toString()}`, RedirectType.replace);
  });

  redirect("/dashboard", RedirectType.replace);
};
