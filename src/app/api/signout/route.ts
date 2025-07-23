import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("sid");
  return new Response(null, {
    status: 204,
  });
}
