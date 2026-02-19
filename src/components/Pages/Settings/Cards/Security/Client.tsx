"use client";
import { Card, Stack, Typography } from "@mui/material";
import type { UserDTO } from "@/types/User";
import { SnackbarProvider } from "notistack";
import ForgotPassword from "@/components/Dialogs/ForgotPassword";
import React from "react";
import PasswordSection from "./Password";
import TOTPSection from "./TOTP";
import SessionsSection from "./Sessions";
import type { AuthSessionDTO } from "@/types/Session";

export default function SecuritySettingsCardClient({
  user,
  csrfToken,
  currentSessionId,
  sessions,
}: {
  user: UserDTO;
  csrfToken: string;
  currentSessionId: string;
  sessions: AuthSessionDTO[];
}) {
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
      <Card
        variant="outlined"
        sx={{ display: "flex", p: 2, flexDirection: "column", gap: 2 }}
      >
        <Stack>
          <Typography variant="h5" component={"h3"}>
            セキュリティ設定
          </Typography>
          <Typography variant="body2">
            パスワードの変更や二段階認証の設定を行います。
          </Typography>
        </Stack>
        <PasswordSection
          user={user}
          csrfToken={csrfToken}
          handleClickOpen={handleClickOpen}
        />
        <TOTPSection user={user} csrfToken={csrfToken} />
        <SessionsSection
          currentSessionId={currentSessionId}
          sessions={sessions}
          csrfToken={csrfToken}
        />
      </Card>
      <ForgotPassword
        open={open}
        handleClose={handleClose}
        csrfToken={csrfToken}
      />
    </SnackbarProvider>
  );
}
