import Session from "@/types/Session";
import ProfileClient from "@/components/Pages/Profile/ProfileClient";

export const metadata = {
  title: "プロフィール",
  description: "ユーザープロフィールページ",
};

export default async function ProfilePage() {
  const session = await Session.get();
  const user = session!.user;
  const userDTO = user.convertPlain();

  return <ProfileClient user={userDTO} />;
}
