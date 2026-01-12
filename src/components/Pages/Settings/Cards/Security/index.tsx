import { generateCSRFToken } from "@/lib/CSRF";
import { User } from "@/types/User";
import SecuritySettingsCardClient from "./Client";
import Session from "@/types/Session";
import { unauthorized } from "next/navigation";

export default async function SecuritySettingsCard({ user }: { user: User }) {
  const uid = user.id!;
  const csrfToken = generateCSRFToken(uid);
  const session = await Session.get();
  if (!session) {
    unauthorized();
  }
  const sessions = await Session.list({ asPlain: true });
  return (
    <SecuritySettingsCardClient
      user={user}
      csrfToken={csrfToken}
      sid={session?.id}
      sessions={sessions}
    />
  );
}
