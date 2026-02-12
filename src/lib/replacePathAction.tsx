"use server";
import { redirect, RedirectType } from "next/navigation";

/**
 * # replacePath
 * 現在のパスを/dashboard/settingsに置き換える関数
 * @returns void
 */
export const replacePath = async (path: string, replaceDuration = 0) => {
  const ignoredQueryPath = path;
  // replaceDuration を安全に扱う: 数値化、非負化、上限クランプ
  const DEFAULT_MAX_DELAY_MS = 5000;
  const envMax =
    typeof process !== "undefined"
      ? process.env.MAX_REPLACE_DELAY_MS
      : undefined;
  const MAX_REPLACE_DELAY_MS = envMax
    ? Number.parseInt(envMax, 10) || DEFAULT_MAX_DELAY_MS
    : DEFAULT_MAX_DELAY_MS;

  let duration = Number(replaceDuration);
  if (!Number.isFinite(duration) || Number.isNaN(duration)) {
    duration = 0;
  }
  duration = Math.trunc(duration);
  if (duration < 0) duration = 0;

  const maxDelay =
    Number.isFinite(MAX_REPLACE_DELAY_MS) && MAX_REPLACE_DELAY_MS > 0
      ? Math.trunc(MAX_REPLACE_DELAY_MS)
      : DEFAULT_MAX_DELAY_MS;
  if (duration > maxDelay) {
    console.warn(
      `replacePath: replaceDuration (${duration}) exceeds max (${maxDelay}), clamping to max`,
    );
    duration = maxDelay;
  }

  if (duration > 0) {
    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  redirect(ignoredQueryPath, RedirectType.push);
};
