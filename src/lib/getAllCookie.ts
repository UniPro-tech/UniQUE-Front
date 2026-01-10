import { cookies } from "next/headers";

export const getAllCookies = async (): Promise<string> => {
  const cookieStore = await cookies();
  const cookie = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join(";");
  return cookie;
};
