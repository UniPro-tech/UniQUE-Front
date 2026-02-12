/**
 * エラーハンドリング用ユーティリティ
 * Access Deniedエラーの検出と処理を統一化
 */

import {
  AuthorizationErrorCodes,
  AuthorizationErrors,
} from "@/types/Errors/AuthorizationErrors";
import { getAuthorizationErrorSnackbarData } from "@/types/Errors/AuthorizationErrors";
import { SnackbarData } from "@/components/TemporarySnackProvider";

export class AccessDeniedError extends Error {
  readonly errorCode = AuthorizationErrorCodes.AccessDenied;

  constructor(
    message: string = "Access denied",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export class UnauthorizedError extends Error {
  readonly errorCode = AuthorizationErrorCodes.Unauthorized;

  constructor(
    message: string = "Unauthorized",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * HTTP ステータスコードからエラーを生成
 */
export function createAuthorizationErrorFromStatus(
  status: number,
): Error | null {
  switch (status) {
    case 401:
      return AuthorizationErrors.Unauthorized;
    case 403:
      return AuthorizationErrors.AccessDenied;
    default:
      return null;
  }
}

/**
 * レスポンスからAuthorizationエラーを抽出
 * @returns エラーがある場合はError、ない場合はnull
 */
export function extractAuthorizationError(response: Response): Error | null {
  if (response.status === 403) {
    return AuthorizationErrors.AccessDenied;
  }
  if (response.status === 401) {
    return AuthorizationErrors.Unauthorized;
  }
  return null;
}

/**
 * エラーがAccess Deniedかチェック
 */
export function isAccessDeniedError(
  error: unknown,
): error is typeof AuthorizationErrors.AccessDenied {
  return error === AuthorizationErrors.AccessDenied;
}

/**
 * エラーがUnauthorizedかチェック
 */
export function isUnauthorizedError(
  error: unknown,
): error is typeof AuthorizationErrors.Unauthorized {
  return error === AuthorizationErrors.Unauthorized;
}

/**
 * Authorization エラーがSnackbar用メッセージを取得
 */
export function getAuthorizationErrorSnackbar(
  error: Error,
): SnackbarData | null {
  if (isAccessDeniedError(error)) {
    return getAuthorizationErrorSnackbarData(
      AuthorizationErrorCodes.AccessDenied,
    );
  }
  if (isUnauthorizedError(error)) {
    return getAuthorizationErrorSnackbarData(
      AuthorizationErrorCodes.Unauthorized,
    );
  }
  return null;
}

/**
 * エラーハンドリング統計用のログ記録
 */
export interface ErrorLog {
  timestamp: number;
  errorCode: string;
  errorMessage: string;
  url: string;
  userAgent: string;
}

/**
 * エラーログをローカルストレージに記録（クライアント側）
 */
export function logErrorLocally(errorCode: string, errorMessage: string): void {
  if (typeof window === "undefined") return;

  try {
    const logs: ErrorLog[] = JSON.parse(
      localStorage.getItem("error_logs") || "[]",
    );
    logs.push({
      timestamp: Date.now(),
      errorCode,
      errorMessage,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // 最新100件のみ保持
    if (logs.length > 100) {
      logs.shift();
    }

    localStorage.setItem("error_logs", JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to log error locally:", e);
  }
}

/**
 * エラーログを取得
 */
export function getErrorLogs(): ErrorLog[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem("error_logs") || "[]");
  } catch (e) {
    console.error("Failed to retrieve error logs:", e);
    return [];
  }
}

/**
 * エラーログをクリア
 */
export function clearErrorLogs(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("error_logs");
  } catch (e) {
    console.error("Failed to clear error logs:", e);
  }
}
