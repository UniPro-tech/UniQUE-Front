"use server";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { getAllCookies } from "@/lib/getAllCookie";
import { apiGet } from "@/lib/apiClient";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { getUserById, saveUser } from "@/lib/Users";
import { Discord } from "@/types/Discord";

export const approveRegistApplyAction = async (
  _prevState: FormStatus | null,
  formData: FormData | null
): Promise<FormStatus | null> => {
  if (!formData) {
    return {
      status: "error",
      message: "不正なフォームデータです。",
    };
  }
  const userId = formData.get("userId") as string;
  const period = formData.get("period") as string;
  const email = formData.get("email") as string;
  const mailboxPassword = formData.get("mailboxPassword") as string;

  try {
    const discordDataRes = await apiGet(`/users/${userId}/discord`);
    if (!discordDataRes.ok) {
      return {
        status: "error",
        message: "メンバーのDiscord情報の取得に失敗しました。",
      };
    }
    const discordData = toCamelcase(await discordDataRes.json()) as {
      data: Discord[];
    };
    const discordId = discordData.data[0]?.discordId;

    const discordToken = process.env.DISCORD_BOT_TOKEN;

    const roleAddRes = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}/roles/${process.env.DISCORD_MEMBER_ROLE_ID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!roleAddRes.ok) {
      const errorData = await roleAddRes.json();
      console.error("Failed to add role to user", roleAddRes.status, errorData);
      return {
        status: "error",
        message:
          "メンバーの役職付与に失敗しました。ユーザーがサーバーに参加しているか確認してください:" +
          (errorData.message || ""),
      };
    }

    const user = await getUserById(userId);
    if (!user) {
      return {
        status: "error",
        message: "該当するユーザーが見つかりません。",
      };
    }

    // Update user status
    user.email = email;
    user.period = period;
    user.joinedAt = new Date();
    user.isEnable = true;
    await saveUser(user);

    const response = await fetch(
      `https://discord.com/api/v10/users/@me/channels`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_id: discordId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create DM channel", response.status, errorData);
      return {
        status: "error",
        message: errorData.message || "メンバーの承認に失敗しました。",
      };
    }

    const channelData = await response.json();

    const embeddedMessage = {
      title: "メンバー申請が承認されました！",
      description:
        "あなたのメンバー登録が承認されました！\n以下の情報をご確認ください。",
      color: 5814783,
      fields: [
        {
          name: "登録期",
          value: period,
        },
        {
          name: "メールアドレス",
          value: "`" + email + "`",
        },
        {
          name: "メールボックスパスワード",
          value: mailboxPassword,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    const messageResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelData.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ embeds: [embeddedMessage] }),
      }
    );

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error(
        "Failed to send message to user",
        messageResponse.status,
        errorData
      );
      return {
        status: "error",
        message:
          errorData.message ||
          "メンバーへの通知メッセージの送信に失敗しました。",
      };
    }

    return {
      status: "success",
      message: "メンバーを承認しました。",
    };
  } catch (error) {
    console.error("Error occurred while approving regist apply", error);
    return {
      status: "error",
      message: "メンバーの承認中にエラーが発生しました。",
    };
  }
};
