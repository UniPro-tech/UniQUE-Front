import { notFound } from "next/navigation";
import User from "@/types/User";
import UserDetailClient from "@/components/Pages/Members/UserDetailClient";

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

  const userDTO = user.convertPlain();
  return <UserDetailClient user={userDTO} />;
}
