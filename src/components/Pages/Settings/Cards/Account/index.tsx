import { generateCSRFToken } from "@/libs/csrf";
import AccountSettingsCardClient from "./Client";
import { UserData } from "@/classes/types/User";

export default async function AccountSettingsCard({
  user,
}: {
  user: UserData;
}) {
  const sid = user.id;
  const csrfToken = await generateCSRFToken(sid!);
  return <AccountSettingsCardClient user={user} csrfToken={csrfToken} />;
}
