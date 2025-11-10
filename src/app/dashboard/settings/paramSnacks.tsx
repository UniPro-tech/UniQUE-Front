"use client";

import { enqueueSnackbar, SnackbarProvider, VariantType } from "notistack";
import { useEffect } from "react";
import { replacePath } from "./replacePath";

export interface SnackbarData {
  message: string;
  variant: VariantType;
}

/**
 * # ParamSnacks
 * 最初だけsnackbarを表示するコンポーネント
 * ## usecase
 * ページ遷移時にクエリパラメータで渡された情報を元にsnackbarを表示したい場合など
 * @param snacks SnackbarData[] 表示するsnackbarの情報配列
 * @returns JSX.Element
 */
export default function ParamSnacks({ snacks }: { snacks: SnackbarData[] }) {
  useEffect(() => {
    snacks.forEach((snack) => {
      enqueueSnackbar(snack.message, { variant: snack.variant });
    });
    if (snacks.length > 0) {
      replacePath();
    }
  }, [snacks]);
  return <SnackbarProvider></SnackbarProvider>;
}
