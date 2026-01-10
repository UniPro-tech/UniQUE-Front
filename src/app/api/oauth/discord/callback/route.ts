import { VerifyCSRFToken } from "@/lib/CSRF";
import { verifyEmailCode } from "@/lib/EmailVerification";
import { apiPut } from "@/lib/apiClient";
import { getSession } from "@/lib/Session";
import { cookies } from "next/headers";
import { unauthorized } from "next/navigation";
import { decodeBase64 } from "tweetnacl-util";

export const GET = async (req: Request) => {
  const client_id = process.env.DISCORD_CLIENT_ID;
  const client_secret = process.env.DISCORD_CLIENT_SECRET;
  const redirect_uri = process.env.DISCORD_REDIRECT_URI;

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const signupCode = cookieStore.get("signup_code")?.value;
  if (signupCode) {
    cookieStore.delete("signup_code");
  }
  const baseUrl = `${url.protocol}//${url.host}/${
    !signupCode ? "dashboard/settings?" : "signup?code=" + signupCode + "&"
  }`;

  if (!state)
    return Response.redirect(`${baseUrl}oauth=discord&status=error`, 302);

  const stateBytes = decodeBase64(state);
  const stateDecoded = new TextDecoder().decode(stateBytes);

  if (VerifyCSRFToken(stateDecoded, false) !== "discord_oauth") {
    return Response.redirect(`${baseUrl}oauth=discord&status=error`, 302);
  }

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  // Exchange code for access token
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: client_id || "",
      client_secret: client_secret || "",
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri || "",
    }),
  });

  if (!tokenResponse.ok) {
    return Response.redirect(`${baseUrl}oauth=discord&status=error`, 302);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Fetch user info
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    return Response.redirect(`${baseUrl}oauth=discord&status=error`, 302);
  }

  const userData = await userResponse.json();

  const session = await getSession();
  const emailverify = await verifyEmailCode(signupCode || "");
  if (!session?.user && !emailverify) {
    unauthorized();
  }
  const userId = session?.user.id || emailverify?.user_id;

  const res = await apiPut(`/users/${userId}/discord`, {
    discord_id: userData.id,
    custom_id: userData.username,
  });

  const res2 = await fetch(
    "https://discord.com/api/guilds/" +
      process.env.DISCORD_GUILD_ID +
      "/members/" +
      userData.id,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    }
  );

  if (res.status !== 201 || (res2.status !== 201 && res2.status !== 204)) {
    return Response.redirect(`${baseUrl}oauth=discord&status=error`, 302);
  }

  return Response.redirect(`${baseUrl}oauth=discord&status=success`, 302);
};
