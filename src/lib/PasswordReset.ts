/**
 * Password Reset API functions
 * Uses Next.js API routes to avoid CORS issues
 */

export interface PasswordResetResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

/**
 * Request password reset by email
 */
export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetResponse> {
  try {
    // サーバーサイドかどうか判定
    const isServer = typeof window === "undefined";
    let url = "/api/password-reset/request";
    if (isServer) {
      // サーバーサイドなら絶対URLを組み立てる
      const base =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.VERCEL_URL ||
        "http://localhost:3000";
      // VERCEL_URLはドメインだけなのでhttp(s)付与
      url = base.startsWith("http")
        ? `${base}/api/password-reset/request`
        : `https://${base}/api/password-reset/request`;
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      ok: false,
      error: "Failed to request password reset",
    };
  }
}

/**
 * Confirm password reset with code and new password
 */
export async function confirmPasswordReset(
  code: string,
  password: string,
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        password,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Password reset confirm error:", error);
    return {
      ok: false,
      error: "Failed to confirm password reset",
    };
  }
}
