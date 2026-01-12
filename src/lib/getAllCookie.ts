// サーバー/クライアント両対応の cookie 取得
export const getAllCookies = async (): Promise<string> => {
  // クライアントバンドルの場合は document.cookie を優先
  if (typeof window !== "undefined") {
    return typeof document !== "undefined" ? document.cookie ?? "" : "";
  }

  // サーバーの場合のみ next/headers を動的インポート
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join(";");
  return cookie;
};
