import { headers } from "next/headers";

export const getRealIPAddress = async (): Promise<string> => {
  const headersList = await headers();

  // CloudflareのCF-Connecting-IPヘッダーを優先
  const cfConnectingIp = headersList.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // フォールバック: X-Forwarded-For
  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    // 複数のIPがある場合は最初のものを取得
    return xForwardedFor.split(",")[0].trim();
  }

  // フォールバック: X-Real-IP
  const xRealIp = headersList.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  // すべて取得できない場合は不明として返す
  return "unknown";
};
