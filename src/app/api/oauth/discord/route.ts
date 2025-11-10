import { generateCSRFToken } from "@/lib/CSRF";
import { encodeBase64 } from "tweetnacl-util";

export const GET = async (req: Request) => {
  const client_id = process.env.DISCORD_CLIENT_ID;
  const redirect_uri = process.env.DISCORD_REDIRECT_URI;
  const scope = "openid+identify";
  const state = generateCSRFToken("discord_oauth", false);
  const discord_oauth_url = `https://discord.com/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
    redirect_uri || ""
  )}&scope=${scope}&state=${encodeBase64(new TextEncoder().encode(state))}`;

  return Response.redirect(discord_oauth_url, 302);
};
