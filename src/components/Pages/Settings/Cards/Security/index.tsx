import { generateCSRFToken } from "@/lib/CSRF";
import { User } from "@/types/User";
import SecuritySettingsCardClient from "./Client";

export default async function SecuritySettingsCard({ user }: { user: User }) {
  const sid = user.id;
  const csrfToken = await generateCSRFToken(sid);
  return <SecuritySettingsCardClient user={user} csrfToken={csrfToken} />;
}
