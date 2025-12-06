"use server";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { Discord } from "@/types/Discord";

export const approveRegistApplyAction = async (
  _prevState: FormStatus | null,
  formData: FormData | null
): Promise<FormStatus | null> => {
  if (!formData) {
    console.log("No form data");
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
    const discordDataRes = await fetch(
      `${process.env.RESOURCE_API_URL}/users/${userId}/discord`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!discordDataRes.ok) {
      console.log(
        "Failed to fetch Discord data",
        discordDataRes.status,
        await discordDataRes.text()
      );
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
