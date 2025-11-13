import { generateCSRFToken } from "@/lib/CSRF";
import { cookies } from "next/headers";
import { encodeBase64 } from "tweetnacl-util";

export const GET = async (req: Request) => {
  const client_id = process.env.DISCORD_CLIENT_ID;
  const redirect_uri = process.env.DISCORD_REDIRECT_URI;
  const scope = "openid+identify";
  const state = generateCSRFToken("discord_oauth", false);
  const signupParam = new URL(req.url).searchParams.get("signup");
  if (signupParam) {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "signup_code",
      value: signupParam,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  const discord_oauth_url = `https://discord.com/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
    redirect_uri || ""
  )}&scope=${scope}&state=${encodeBase64(new TextEncoder().encode(state))}`;

  return Response.redirect(discord_oauth_url, 302);
};
