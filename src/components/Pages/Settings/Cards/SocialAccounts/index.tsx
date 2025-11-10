import { generateCSRFToken } from "@/lib/CSRF";
import { User } from "@/types/User";
import SocialAccountsCardClietnt from "./Client";

export default async function SocialAccountsSettingsCard({
  user,
}: {
  user: User;
}) {
  const sid = user.id;
  const csrfToken = await generateCSRFToken(sid);
  return <SocialAccountsCardClietnt user={user} csrfToken={csrfToken} />;
}
