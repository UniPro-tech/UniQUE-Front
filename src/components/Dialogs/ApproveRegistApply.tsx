"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import { User } from "@/types/User";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

interface ApproveRegistApplyProps {
  open: boolean;
  dataAction: (
    _prevState: FormStatus | null,
    formData: FormData | null
  ) => FormStatus | null | Promise<FormStatus | null>;
  handleClose: () => void;
  user: User | null;
}

export default function ApproveRegistApplyDialog({
  open,
  dataAction,
  handleClose,
  user,
}: ApproveRegistApplyProps) {
  const [state, action, isPending] = React.useActionState(
    dataAction,
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
        <form action={action} id="approve-regist-apply-data-dialog">
          <DialogTitle>メンバーの承認</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            <DialogContentText>
              下記の情報を入力後、承認ボタンを押してください。
            </DialogContentText>
            <input type="hidden" name="userId" value={user?.id || ""} />
            <FormControl fullWidth>
              <InputLabel id="period-label">所属期</InputLabel>
              <Select
                labelId="period-label"
                name="period"
                fullWidth
                label="所属期"
                color="primary"
                variant="outlined"
              >
                <MenuItem value={1}>1期</MenuItem>
                <MenuItem value={2}>2期</MenuItem>
                <MenuItem value={3}>3期</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="メールボックスのパスワード"
              type="password"
              name="mailboxPassword"
              required
              fullWidth
              variant="outlined"
              placeholder="メールボックスのパスワードを入力してください"
              disabled={isPending}
            />
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button onClick={handleClose}>キャンセル</Button>
            <Button variant="contained" type="submit">
              承認
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </SnackbarProvider>
  );
}
