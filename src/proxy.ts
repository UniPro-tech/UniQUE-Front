import { NextResponse, NextRequest } from "next/server";
import { getSession } from "./lib/Session";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/signin", request.url));
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|signin|signup).*)",
};
