"use server";

/**
 * Discord API を使用してユーザーに DM を送信します。
 * @param discordUserId - Discord のユーザー ID
 * @param message - 送信するメッセージの内容
 * @returns 送信が成功した場合は true、失敗した場合は false
 */
export async function sendDiscordDM(
  discordUserId: string,
  message: string,
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    console.error("DISCORD_BOT_TOKEN が設定されていません");
    return false;
  }

  try {
    // 1. DM チャンネルを作成
    const dmChannelResponse = await fetch(
      "https://discord.com/api/v10/users/@me/channels",
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: discordUserId,
        }),
      },
    );

    if (!dmChannelResponse.ok) {
      console.error(
        "DM チャンネルの作成に失敗:",
        await dmChannelResponse.text(),
      );
      return false;
    }

    const dmChannel = await dmChannelResponse.json();
    const channelId = dmChannel.id;

    // 2. メッセージを送信
    const messageResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
        }),
      },
    );

    if (!messageResponse.ok) {
      console.error("メッセージの送信に失敗:", await messageResponse.text());
      return false;
    }

    console.log(
      `Discord DM を送信しました: userId=${discordUserId}, channelId=${channelId}`,
    );
    return true;
  } catch (error) {
    console.error("Discord DM の送信中にエラーが発生:", error);
    return false;
  }
}

/**
 * Discord API を使用してユーザーにロールを付与します。
 * @param discordUserId - Discord のユーザー ID
 * @param roleId - 付与するロールの ID
 * @returns 付与が成功した場合は true、失敗した場合は false
 */
export async function assignDiscordRole(
  discordUserId: string,
  roleId?: string,
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const memberRoleId = roleId || process.env.DISCORD_MEMBER_ROLE_ID;

  if (!botToken) {
    console.error("DISCORD_BOT_TOKEN が設定されていません");
    return false;
  }

  if (!guildId) {
    console.error("DISCORD_GUILD_ID が設定されていません");
    return false;
  }

  if (!memberRoleId) {
    console.error("DISCORD_MEMBER_ROLE_ID が設定されていません");
    return false;
  }

  try {
    // ユーザーにロールを付与
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${memberRoleId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      // 204 No Content が正常なレスポンスなので、チェックを調整
      if (response.status === 204) {
        console.log(
          `Discord ロールを付与しました: userId=${discordUserId}, roleId=${memberRoleId}`,
        );
        return true;
      }
      console.error("ロールの付与に失敗:", await response.text());
      return false;
    }

    console.log(
      `Discord ロールを付与しました: userId=${discordUserId}, roleId=${memberRoleId}`,
    );
    return true;
  } catch (error) {
    console.error("Discord ロールの付与中にエラーが発生:", error);
    return false;
  }
}

/**
 * ユーザーがサーバーに参加しているかチェックします。
 * @param discordUserId - Discord のユーザー ID
 * @returns サーバーに参加している場合は true、そうでない場合は false
 */
export async function isUserInGuild(discordUserId: string): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    console.error("Discord の設定が不足しています");
    return false;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      },
    );

    return response.ok;
  } catch (error) {
    console.error("ユーザーのサーバー参加状況の確認中にエラー:", error);
    return false;
  }
}
