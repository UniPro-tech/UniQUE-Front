import Drawer from "@/components/drawer";
import { PrismaClient } from "@/generated/prisma";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid");
  if (!sid) redirect("/signin");
  const prisma = new PrismaClient();
  const session = await prisma.sessions.findUnique({
    where: { id: sid.value },
  });
  if (!session) {
    const res = await fetch(
      `${
        process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"
      }/api/signout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    redirect("/signin");
  }
  const user = await prisma.users.findUnique({
    where: { id: session?.user_id },
  });
  return (
    <html lang="ja">
      <body className={`antialiased`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Drawer>{children}</Drawer>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
