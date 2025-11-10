import crypto from "crypto";

export const GET = async (req: Request) => {
  const client_id = process.env.DISCORD_CLIENT_ID;
  const redirect_uri = process.env.DISCORD_REDIRECT_URI;
  const scope = "openid+identify";
  const state = crypto.randomBytes(16).toString("hex");
  const discord_oauth_url = `https://discord.com/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
    redirect_uri || ""
  )}&scope=${scope}&state=${state}`;
  console.log(discord_oauth_url);

  return Response.redirect(discord_oauth_url, 302);
};
