import { unauthorized } from "next/navigation";
import { Session } from "@/classes/Session";
import { generateCSRFToken } from "@/libs/csrf";
import SecuritySettingsCardClient from "./Client";
import { UserData } from "@/classes/types/User";

export default async function SecuritySettingsCard({
  user,
}: {
  user: UserData;
}) {
  const uid = user.id!;
  const csrfToken = generateCSRFToken(uid);
  const session = await Session.getCurrent();
  if (!session) {
    unauthorized();
  }
  const sessions = (await Session.getByUserId(uid)).map((s) => s.toJson());
  return (
    <SecuritySettingsCardClient
      user={user}
      csrfToken={csrfToken}
      currentSessionId={session.id}
      sessions={sessions}
    />
  );
}
