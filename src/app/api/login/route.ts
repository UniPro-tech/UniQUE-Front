import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import * as crypto from "crypto";
import { ulid } from "ulid";

export async function POST(req: Request) {
  const body = await req.text();
  console.log("Received body:", body);
  const { custom_id, password } = JSON.parse(body);
  const prisma = new PrismaClient();
  const user = await prisma.users.findFirst({
    where: { custom_id },
  });

  if (!user) {
    await prisma.$disconnect();
    return NextResponse.json(
      { message: "ユーザーが見つかりません" },
      { status: 404 }
    );
  }
  if (user.is_enable === false) {
    await prisma.$disconnect();
    return NextResponse.json(
      { message: "ユーザーは無効です。未承認の可能性があります。" },
      { status: 403 }
    );
  }

  const password_hash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (user.password_hash === password_hash) {
    const session = await prisma.sessions.create({
      data: {
        id: ulid(),
        user_id: user.id,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      },
    });
    const token = session.id;

    (await cookies()).set({
      name: "sid",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    await prisma.$disconnect();
    return NextResponse.json({ message: "ログイン成功" });
  }
  await prisma.$disconnect();
  return NextResponse.json({ message: "認証失敗" }, { status: 401 });
}
