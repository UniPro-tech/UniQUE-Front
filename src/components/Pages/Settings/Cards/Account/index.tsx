import { generateCSRFToken } from "@/lib/CSRF";
import type { UserDTO } from "@/types/User";
import AccountSettingsCardClient from "./Client";

export default async function AccountSettingsCard({ user }: { user: UserDTO }) {
  const sid = user.id;
  const csrfToken = await generateCSRFToken(sid!);
  return <AccountSettingsCardClient user={user} csrfToken={csrfToken} />;
}
