import type { UserDTO } from "@/types/User";
import SocialAccountsCardClietnt from "./Client";
import * as SocialAccounts from "@/lib/resources/SocialAccounts";

export default async function SocialAccountsSettingsCard({
  user,
}: {
  user: UserDTO;
}) {
  // 外部アイデンティティのリストを取得
  let externalIdentities: Awaited<ReturnType<typeof SocialAccounts.list>> = [];
  try {
    externalIdentities = await SocialAccounts.list(user.id);
  } catch (error) {
    console.error("Failed to fetch external identities:", error);
  }

  return (
    <SocialAccountsCardClietnt
      user={user}
      externalIdentities={externalIdentities}
    />
  );
}
