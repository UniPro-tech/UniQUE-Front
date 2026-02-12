"use client";

import React, { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { getAuthorizationErrorSnackbarData } from "@/types/Errors/AuthorizationErrors";
import { AuthorizationErrorCodes } from "@/types/Errors/AuthorizationErrors";

/**
 * URLクエリパラメータからアクセス拒否エラーを検出してアラートを表示する
 * 使用例: /dashboard?error=access_denied
 */
export function AccessDeniedAlert() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const isAccessDenied = error === "access_denied";
  const [showAlert, setShowAlert] = useState(isAccessDenied);

  useEffect(() => {
    if (isAccessDenied && showAlert) {
      // 10秒後に自動的に非表示
      const timer = setTimeout(() => setShowAlert(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isAccessDenied, showAlert]);

  if (!showAlert || !isAccessDenied) {
    return null;
  }

  const snackbarData = getAuthorizationErrorSnackbarData(
    AuthorizationErrorCodes.AccessDenied,
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity={snackbarData.variant === "error" ? "error" : "warning"}
        onClose={() => setShowAlert(false)}
      >
        {snackbarData.message}
      </Alert>
    </Box>
  );
}
