import { Session } from "@/classes/Session";
import Profile from "@/components/Cards/Profile";

export const metadata = {
  title: "プロフィール",
  description: "ユーザープロフィールページ",
};

export default async function ProfilePage() {
  const session = await Session.getCurrent();
  const user = (await session?.getUser()).toJson();

  return <Profile user={user} variant="self" showTimestamps />;
}
