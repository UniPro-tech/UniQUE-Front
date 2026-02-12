import { NextRequest } from "next/server";
import Session from "@/types/Session";
import { apiPost } from "@/lib/apiClient";
import type { CreateExternalIdentityRequest } from "@/types/ExternalIdentity";
import { getUserById } from "@/lib/resources/Users";
import { assignDiscordRole } from "@/lib/discord";
import { sanitizeForLog } from "@/lib/logSanitize";

/**
 * Discord Botを使用してユーザーをギルド（サーバー）に追加
 */
async function addUserToGuild(
  discordUserId: string,
  accessToken: string,
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    console.error("Discord Bot環境変数が設定されていません");
    return false;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      },
    );

    if (response.ok || response.status === 204) {
      console.log(
        `Successfully added user ${discordUserId} to guild ${guildId}`,
      );
      return true;
    } else if (response.status === 201) {
      // 201: User was already a member
      console.log(
        `User ${discordUserId} is already a member of guild ${guildId}`,
      );
      return true;
    } else {
      const errorText = await response.text();
      console.error(
        `Failed to add user to guild: ${response.status} - ${errorText}`,
      );
      return false;
    }
  } catch (error) {
    console.error("Error adding user to guild:", error);
    return false;
  }
}

/**
 * Discord OAuthコールバックエンドポイント
 * Discordからのリダイレクトを受け取り、外部アイデンティティを登録する
 */
export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateParam = searchParams.get("state");

  // stateをデコードしてfromとcodeを取得
  let from = "settings";
  let emailVerifyCode: string | undefined;
  try {
    if (stateParam) {
      const stateObj = JSON.parse(
        Buffer.from(stateParam, "base64").toString("utf-8"),
      );
      from = stateObj.from || "settings";
      emailVerifyCode = stateObj.code;
    }
  } catch (e) {
    console.error("Failed to parse state:", sanitizeForLog(e));
  }

  // エラーチェック
  if (error) {
    console.error("Discord OAuth error:", sanitizeForLog(error));
    let redirectPath: string;
    if (from === "email_verify" && emailVerifyCode) {
      redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=true`;
    } else if (from === "signup") {
      redirectPath = `/signup?completed=true&oauth=discord&status=error`;
    } else {
      redirectPath = `/dashboard/settings?oauth=Discord&status=error`;
    }
    return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
  }

  if (!code) {
    console.error("Discord OAuth code is missing");
    let redirectPath: string;
    if (from === "email_verify" && emailVerifyCode) {
      redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=true`;
    } else if (from === "signup") {
      redirectPath = `/signup?completed=true&oauth=discord&status=error`;
    } else {
      redirectPath = `/dashboard/settings?oauth=Discord&status=error`;
    }
    return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
  }

  // 環境変数の確認
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("Discord OAuth環境変数が設定されていません");
    let redirectPath: string;
    if (from === "email_verify" && emailVerifyCode) {
      redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=true`;
    } else if (from === "signup") {
      redirectPath = `/signup?completed=true&oauth=discord&status=error`;
    } else {
      redirectPath = `/dashboard/settings?oauth=Discord&status=error`;
    }
    return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
  }

  try {
    // 1. アクセストークンを取得
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const tokenErr = await tokenResponse.text().catch(() => null);
      console.error(
        "Failed to get Discord access token:",
        sanitizeForLog(tokenErr),
      );
      let redirectPath: string;
      if (from === "email_verify" && emailVerifyCode) {
        redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=true`;
      } else if (from === "signup") {
        redirectPath = `/signup?completed=true&oauth=discord&status=error`;
      } else {
        redirectPath = `/dashboard/settings?oauth=Discord&status=error`;
      }
      return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
    }

    const tokenData = await tokenResponse.json();
    const {
      access_token,
      refresh_token,
      expires_in,
    }: {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    } = tokenData;

    // 2. Discordユーザー情報を取得
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const userErr = await userResponse.text().catch(() => null);
      console.error(
        "Failed to get Discord user info:",
        sanitizeForLog(userErr),
      );
      let redirectPath: string;
      if (from === "email_verify" && emailVerifyCode) {
        redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=true`;
      } else if (from === "signup") {
        redirectPath = `/signup?completed=true&oauth=discord&status=error`;
      } else {
        redirectPath = `/dashboard/settings?oauth=Discord&status=error`;
      }
      return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
    }

    const discordUser = await userResponse.json();
    const discordUserId = sanitizeForLog(discordUser.id, 64);

    // 3. 外部アイデンティティをAPIに登録
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
    const requestBody: CreateExternalIdentityRequest = {
      provider: "discord",
      external_user_id: discordUserId,
      access_token,
      refresh_token,
      token_expires_at: expiresAt,
    };

    const session = await Session.get();
    let response: Response;

    if (session?.userId) {
      response = await apiPost(
        `/users/${session.userId}/external_identities`,
        requestBody,
      );
    } else if (from === "email_verify" && emailVerifyCode) {
      response = await apiPost(`/internal/users/email_verify/discord_link`, {
        code: emailVerifyCode,
        external_user_id: discordUserId,
        access_token,
        refresh_token,
        token_expires_at: expiresAt,
      });
    } else {
      console.error("Could not determine user ID");
      return Response.redirect(
        new URL(`/signin?redirect=/dashboard/settings`, request.nextUrl.origin),
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        "Failed to link Discord account:",
        sanitizeForLog(errorData),
      );

      // 409 Conflict エラーの場合、既に連携されているアカウント
      if (response.status === 409) {
        let redirectPath: string;
        if (from === "email_verify" && emailVerifyCode) {
          redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=conflict`;
        } else if (from === "signup") {
          redirectPath = `/signup?completed=true&oauth=discord&status=warning&reason=conflict`;
        } else {
          redirectPath = `/dashboard/settings?oauth=Discord&status=warning&reason=conflict`;
        }
        return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
      }

      let redirectPath: string;
      if (from === "email_verify" && emailVerifyCode) {
        redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=true`;
      } else if (from === "signup") {
        redirectPath = `/signup?completed=true&oauth=discord&status=error`;
      } else {
        redirectPath = `/dashboard/settings?oauth=Discord&status=error`;
      }
      return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
    }

    // 5. Discord Botでサーバーに追加
    const addedToGuild = await addUserToGuild(discordUserId, access_token);
    if (!addedToGuild) {
      console.warn(
        "Failed to add user to Discord guild, but external identity was linked",
      );
    }

    // 6. ユーザーがactiveメンバーの場合、メンバーロールを付与
    try {
      let userId: string | undefined;

      if (session?.userId) {
        userId = session.userId;
      } else if (from === "email_verify" && response.ok) {
        // email_verifyの場合、レスポンスからuserIdを取得
        const responseData = await response
          .clone()
          .json()
          .catch(() => ({}));
        userId = responseData.user_id;
      }

      if (userId) {
        const user = await getUserById(userId);
        if (user && user.status === "active") {
          const roleAssigned = await assignDiscordRole(discordUserId);
          if (roleAssigned) {
            console.log(
              `Discord メンバーロールを付与しました: userId=${sanitizeForLog(userId, 64)}, discordUserId=${sanitizeForLog(discordUserId, 64)}`,
            );
          } else {
            console.warn(
              `Discord メンバーロールの付与に失敗しました: userId=${sanitizeForLog(userId, 64)}`,
            );
          }
        } else {
          console.log(
            `ユーザーのステータスがactiveではないため、ロールを付与しませんでした: status=${user?.status}`,
          );
        }
      }
    } catch (error) {
      console.error(
        "メンバーロール付与処理中にエラーが発生:",
        sanitizeForLog(error),
      );
      // エラーが発生してもDiscord連携自体は成功とする
    }

    // 7. 成功したらリダイレクト
    let redirectPath: string;
    if (from === "email_verify" && emailVerifyCode) {
      // メール認証ページに戻る
      redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_linked=true`;
    } else if (from === "signup") {
      redirectPath = `/signup?completed=true&oauth=discord&status=success`;
    } else {
      redirectPath = `/dashboard/settings?oauth=Discord&status=success`;
    }
    return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
  } catch (error) {
    console.error("Discord OAuth callback error:", sanitizeForLog(error));
    let redirectPath: string;
    if (from === "email_verify" && emailVerifyCode) {
      redirectPath = `/email-verify?code=${encodeURIComponent(emailVerifyCode)}&discord_error=true`;
    } else if (from === "signup") {
      redirectPath = `/signup?completed=true&oauth=discord&status=error`;
    } else {
      redirectPath = `/dashboard/settings?oauth=Discord&status=error`;
    }
    return Response.redirect(new URL(redirectPath, request.nextUrl.origin));
  }
};
