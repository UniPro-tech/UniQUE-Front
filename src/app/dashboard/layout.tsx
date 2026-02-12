import Drawer from "@/components/drawer";
import Session from "@/types/Session";
import { AuthorizationErrors } from "@/types/Errors/AuthorizationErrors";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await Session.get();
  const sessionPlain = session ? await session.convertPlain() : null;
  let userRoles = [];
  if (session) {
    try {
      userRoles = await session.user.getRoles();
    } catch (err) {
      if (err !== AuthorizationErrors.AccessDenied) {
        throw err;
      }
      userRoles = [];
    }
  }
  return (
    <html lang="ja">
      <body className={`antialiased`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Drawer session={sessionPlain} userRoles={userRoles}>
            {children}
          </Drawer>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
