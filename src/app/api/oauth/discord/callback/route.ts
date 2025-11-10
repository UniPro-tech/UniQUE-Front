import { getSession } from "@/lib/Session";

export const GET = async (req: Request) => {
  const client_id = process.env.DISCORD_CLIENT_ID;
  const client_secret = process.env.DISCORD_CLIENT_SECRET;
  const redirect_uri = process.env.DISCORD_REDIRECT_URI;

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

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
    console.log(tokenResponse.status, await tokenResponse.text());
    return new Response("Failed to fetch access token", { status: 500 });
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
    console.log(userResponse.status, await userResponse.text());
    return new Response("Failed to fetch user info", { status: 500 });
  }

  const userData = await userResponse.json();

  const session = await getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(
    `${process.env.RESOURCE_API_URL}/users/${session?.user.id}/discord`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        discord_id: userData.id,
        discord_customid: userData.username,
      }),
    }
  );

  if (!res.ok) {
    console.log(res.status, await res.text());
    return new Response("Failed to link Discord account", { status: 500 });
  }

  return new Response(JSON.stringify(userData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
