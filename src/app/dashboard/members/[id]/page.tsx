import { notFound } from "next/navigation";
import Profile from "@/components/Cards/Profile";
import { User } from "@/classes/User";

export const metadata = {
  title: "ユーザー詳細",
  description: "ユーザー詳細ページ",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user;
  try {
    user = await User.getById(id);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    notFound();
  }

  if (!user) {
    notFound();
  }

  const userData = user.toJson();
  return <Profile user={userData} variant="detail" showTimestamps />;
}
