import { getAllCookies } from "./getAllCookie";

interface VerifyEmailResponse {
  created_at: Date;
  expires_at: Date;
  user_id: string;
  verification_code: string;
}

/**
 * ## verifyEmailCode
 * メール認証コードを検証する
 * @param code string 認証コード
 * @returns VerifyEmailResponse
 */
export const verifyEmailCode = async (code: string) => {
  const apiRes = await fetch(
    `${process.env.RESOURCE_API_URL}/email_verify/${encodeURIComponent(code)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: await getAllCookies(),
      },
      credentials: "include",
    }
  );
  if (!apiRes.ok) {
    if (apiRes.status === 404) {
      return null;
    }
    throw new Error(
      `Email verification failed: ${apiRes.status} ${
        apiRes.statusText
      }, ${await apiRes.text()}`
    );
  }
  const resData = await apiRes.json();
  return resData as VerifyEmailResponse;
};

/**
 * ## generateVerificationCode
 * メール認証用コードを生成する
 * @param userId string
 * @returns string 認証用コード
 */
export const generateVerificationCode = async (userId: string) => {
  const apiRes = await fetch(
    `${process.env.RESOURCE_API_URL}/users/${userId}/email_verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: await getAllCookies(),
      },
      body: JSON.stringify({
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      }),
      credentials: "include",
    }
  );
  if (!apiRes.ok) {
    throw new Error(
      `Post email verify action failed: ${apiRes.status} ${
        apiRes.statusText
      }, ${await apiRes.text()}`
    );
  }
  const resData = await apiRes.json();
  const verificationCode = resData.verification_code as string;
  if (!verificationCode) {
    throw new Error("Verification code not found in response");
  }
  return verificationCode;
};

export default {
  verifyEmailCode,
  generateVerificationCode,
};
