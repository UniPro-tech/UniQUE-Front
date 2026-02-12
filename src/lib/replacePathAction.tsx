"use server";
import { redirect, RedirectType } from "next/navigation";

/**
 * # replacePath
 * 現在のパスを/dashboard/settingsに置き換える関数
 * @returns void
 */
export const replacePath = async (path: string, replaceDuration = 0) => {
  const ignoredQueryPath = path;
  // 一定時間後にリダイレクトする
  await new Promise((resolve) => setTimeout(resolve, replaceDuration));
  redirect(`${ignoredQueryPath}`, RedirectType.push);
};
