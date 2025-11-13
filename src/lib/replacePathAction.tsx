"use server";
import { redirect, RedirectType } from "next/navigation";

/**
 * # replacePath
 * 現在のパスを/dashboard/settingsに置き換える関数
 * @returns void
 */
export const replacePath = async (path: string) => {
  const ignoredQueryPath = path;
  redirect(`${ignoredQueryPath}`, RedirectType.push);
};
