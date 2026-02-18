"use server";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { getUserById, saveUser } from "@/lib/resources/Users";
import { list as listExternalIdentities } from "@/lib/resources/SocialAccounts";
import { sendDiscordDM, assignDiscordRole } from "@/lib/discord";

export const approveRegistApplyAction = async (
  _prevState: FormStatus | null,
  formData: FormData | null,
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
  const password = formData.get("mailboxPassword") as string;

  try {
    const user = await getUserById(userId);
    if (!user) {
      return {
        status: "error",
        message: "該当するユーザーが見つかりません。",
      };
    }

    // ユーザー情報を更新
    user.email = email;
    user.affiliationPeriod = period;
    await saveUser(user);

    // POST /users/{id}/approve で承認
    await user.approve();

    // Discord 連携の処理
    try {
      // ユーザーの外部アイデンティティを取得
      const externalIdentities = await listExternalIdentities(userId);
      const discordIdentity = externalIdentities.find(
        (identity) => identity.provider === "discord",
      );

      if (discordIdentity?.externalUserId) {
        const discordUserId = discordIdentity.externalUserId;

        // Discord ロールを付与
        const roleAssigned = await assignDiscordRole(discordUserId);
        if (!roleAssigned) {
          console.warn(`Discord ロールの付与に失敗しました: userId=${userId}`);
        }

        // Discord DM を送信
        const displayName =
          user.profile?.displayName || user.customId || "メンバー";
        const message = `# 🎉 ${displayName}さん、UniProjectへようこそ！\n\nメンバー登録が承認されました。\n## メールアドレスについて\n自由にお使いいただけるメールです。詳しくは[こちらのWiki](https://wiki.uniproject.jp/Tools/メール)をご覧ください。\nメールアドレス: ${email}\nパスワード: ${password}\n\n今後ともよろしくお願いします！`;

        const dmSent = await sendDiscordDM(discordUserId, message);
        if (!dmSent) {
          console.warn(`Discord DM の送信に失敗しました: userId=${userId}`);
        }
      } else {
        console.warn(`Discord 連携が見つかりませんでした: userId=${userId}`);
      }
    } catch (discordError) {
      // Discord 処理が失敗しても承認自体は成功とする
      console.error("Discord 処理中にエラーが発生:", discordError);
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

export const rejectRegistApplyAction = async (
  _prevState: FormStatus | null,
  formData: FormData | null,
): Promise<FormStatus | null> => {
  if (!formData) {
    return { status: "error", message: "不正なフォームデータです。" };
  }
  const userId = formData.get("userId");
  if (!userId || typeof userId !== "string") {
    return { status: "error", message: "userId が指定されていません" };
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return { status: "error", message: "該当するユーザーが見つかりません。" };
    }
    await user.reject();
    return { status: "success", message: "申請を却下しました" };
  } catch (err) {
    console.error("rejectRegistApplyAction error:", err);
    return { status: "error", message: "却下中にエラーが発生しました" };
  }
};
