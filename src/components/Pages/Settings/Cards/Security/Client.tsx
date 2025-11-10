"use client";
import {
  Button,
  Card,
  Divider,
  FormHelperText,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { User } from "@/types/User";
import Base, { FormStatus } from "../Base";
import { useActionState, useEffect } from "react";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import ForgotPassword from "@/components/Dialogs/ForgotPassword";
import React from "react";
import PasswordSection from "./Password";

export default function SecuritySettingsCardClient({
  user,
  csrfToken,
  sid,
}: {
  user: User;
  csrfToken: string;
  sid: string;
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
          sid={sid}
          csrfToken={csrfToken}
          handleClickOpen={handleClickOpen}
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
