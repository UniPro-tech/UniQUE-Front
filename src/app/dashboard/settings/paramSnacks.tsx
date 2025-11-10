"use client";

import { enqueueSnackbar, SnackbarProvider } from "notistack";
import { useEffect } from "react";
import { replacePath } from "./replacePath";

export default function ParamSnacks({
  snacks,
}: {
  snacks: {
    message: string;
    variant: "default" | "error" | "success" | "warning" | "info";
  }[];
}) {
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
