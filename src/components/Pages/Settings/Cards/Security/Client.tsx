"use client";
import {
  Button,
  FormHelperText,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { User } from "@/types/User";
import Base, { FormStatus } from "../Base";
import { useActionState, useEffect } from "react";
import { updateSettings } from "./action";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import ForgotPassword from "@/components/Dialogs/ForgotPassword";
import React from "react";

export default function SecuritySettingsCardClient({
  user,
  csrfToken,
}: {
  user: User;
  csrfToken: string;
}) {
  const [lastResult, action, isPending] = useActionState(
    updateSettings,
    null as null | FormStatus
  );
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  useEffect(() => {
    if (lastResult) {
      enqueueSnackbar(lastResult.message, { variant: lastResult.status });
    }
  }, [lastResult]);
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
      <Base
        sid={user.id}
        action={action}
        isPending={isPending}
        csrfToken={csrfToken}
      >
        <Stack>
          <Typography variant="h6">セキュリティ設定</Typography>
          <Typography variant="body2">
            パスワードの変更や二段階認証の設定を行います。
          </Typography>
        </Stack>
        <input type="hidden" name="id" value={user.id} />
        <TextField
          label="現在のパスワード"
          name="current_password"
          type="password"
          fullWidth
        />
        <TextField
          label="新しいパスワード"
          name="new_password"
          type="password"
          fullWidth
        />
        <Stack>
          <TextField
            label="新しいパスワード（確認）"
            name="confirm_new_password"
            type="password"
            fullWidth
          />
          <FormHelperText>
            パスワードを忘れた場合は、{" "}
            <Link
              onClick={handleClickOpen}
              underline="hover"
              style={{ cursor: "pointer" }}
            >
              こちら
            </Link>
          </FormHelperText>
        </Stack>
        <Button variant="contained" fullWidth type="submit">
          保存
        </Button>
      </Base>
      <ForgotPassword
        open={open}
        handleClose={handleClose}
        csrfToken={csrfToken}
      />
    </SnackbarProvider>
  );
}
