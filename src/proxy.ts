import { NextResponse, NextRequest } from "next/server";
import { getSession } from "./lib/Session";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    const cookieStore = await cookies();
    const sid = cookieStore.get("sid")?.value || null;
    if (sid) cookieStore.delete("sid");
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|signin|signup).*)",
};
