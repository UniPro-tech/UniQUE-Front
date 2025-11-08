"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import { resetPasswordAction } from "../mui-template/signup-side/lib/ResetPasswordAction";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { enqueueSnackbar, SnackbarProvider } from "notistack";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
  csrfToken: string;
}

export default function ForgotPassword({
  open,
  handleClose,
  csrfToken,
}: ForgotPasswordProps) {
  const [state, action, isPending] = React.useActionState(
    resetPasswordAction,
    null as null | FormStatus
  );
  React.useEffect(() => {
    if (state) {
      enqueueSnackbar(state.message, { variant: state.status });
      handleClose();
    }
  }, [state]);
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: { backgroundImage: "none" },
          },
        }}
      >
        <form action={action} id="forgot-password-form">
          <DialogTitle>パスワードリセット</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            <DialogContentText>
              アカウントのユーザーIDを入力してください。パスワードをリセットするためのリンクをお送りします。
              <br />
              ユーザーIDをお忘れの場合は管理者までお問い合わせください。
            </DialogContentText>
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <OutlinedInput
              autoFocus
              required
              margin="dense"
              id="username"
              name="username"
              label="ユーザーID"
              placeholder="ユーザーID"
              type="text"
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button onClick={handleClose}>キャンセル</Button>
            <Button variant="contained" type="submit">
              送信
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </SnackbarProvider>
  );
}
