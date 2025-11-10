import { generateCSRFToken } from "@/lib/CSRF";
import { User } from "@/types/User";
import SecuritySettingsCardClient from "./Client";
import { getSession } from "@/lib/Session";
import { unauthorized } from "next/navigation";

export default async function SecuritySettingsCard({ user }: { user: User }) {
  const uid = user.id;
  const csrfToken = generateCSRFToken(uid);
  const session = await getSession();
  if (!session) {
    unauthorized();
  }
  return (
    <SecuritySettingsCardClient
      user={user}
      csrfToken={csrfToken}
      sid={session?.id}
    />
  );
}
