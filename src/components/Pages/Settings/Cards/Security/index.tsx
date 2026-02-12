import { generateCSRFToken } from "@/lib/CSRF";
import type { UserDTO } from "@/types/User";
import SecuritySettingsCardClient from "./Client";
import Session, { type AuthSessionDTO } from "@/types/Session";
import { unauthorized } from "next/navigation";

export default async function SecuritySettingsCard({
  user,
}: {
  user: UserDTO;
}) {
  const uid = user.id!;
  const csrfToken = generateCSRFToken(uid);
  const session = await Session.get();
  if (!session) {
    unauthorized();
  }
  const sessions: AuthSessionDTO[] = await Session.list();
  return (
    <SecuritySettingsCardClient
      user={user}
      csrfToken={csrfToken}
      currentSessionId={session.sessionId}
      sessions={sessions}
    />
  );
}
