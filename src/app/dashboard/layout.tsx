import Drawer from "@/components/drawer";
import { getSession } from "@/lib/Session";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="ja">
      <body className={`antialiased`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Drawer session={session}>{children}</Drawer>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
