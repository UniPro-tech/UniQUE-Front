import SocialAccountsCardClietnt from "./Client";
import { User } from "@/classes/User";
import { ExternalIdentity } from "@/classes/ExternalIdentity";

export default async function SocialAccountsSettingsCard({
  user,
}: {
  user: User;
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
