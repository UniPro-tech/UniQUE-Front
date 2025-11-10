"use server";
import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

/**
 * # replacePath
 * 現在のパスを/dashboard/settingsに置き換える関数
 * @returns void
 */
export const replacePath = async () => {
  const headersList = await headers();
  const ignoredQueryPath = headersList.get("x-url")?.split("?")[0] || "/";
  redirect(`${ignoredQueryPath}`, RedirectType.replace);
};
