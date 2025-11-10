"use server";
import { redirect, RedirectType } from "next/navigation";

export const replacePath = async () => {
  redirect("/dashboard/settings", RedirectType.replace);
};
