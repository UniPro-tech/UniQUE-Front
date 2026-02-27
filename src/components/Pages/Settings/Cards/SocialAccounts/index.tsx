import SocialAccountsCardClietnt from "./Client";
import { ExternalIdentity } from "@/classes/ExternalIdentity";
import { UserData } from "@/classes/types/User";

export default async function SocialAccountsSettingsCard({
  user,
}: {
  user: UserData;
}) {
  // 外部アイデンティティのリストを取得
  const externalIdentities = (await ExternalIdentity.getByUserId(user.id)).map(
    (identity) => identity.toJson(),
  );

  return (
    <SocialAccountsCardClietnt
      user={user}
      externalIdentities={externalIdentities}
    />
  );
}
