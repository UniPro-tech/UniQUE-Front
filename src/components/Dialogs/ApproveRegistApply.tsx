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
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { approveRegistApplyAction } from "./actions/approveRegistApplyAction";
import PeriodSelectorOptions from "@/lib/PeriodSelectorOptions";

interface ApproveRegistApplyProps {
  open: boolean;
  handleClose: () => void;
  user: User | null;
}

export default function ApproveRegistApplyDialog({
  open,
  handleClose,
  user,
}: ApproveRegistApplyProps) {
  const [state, action, isPending] = React.useActionState(
    approveRegistApplyAction,
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
              <InputLabel id="period-label" required>
                所属期
              </InputLabel>
              <Select
                labelId="period-label"
                name="period"
                fullWidth
                label="所属期"
                color="primary"
                variant="outlined"
              >
                <PeriodSelectorOptions />
              </Select>
            </FormControl>
            <TextField
              label="メールアドレス"
              type="email"
              name="email"
              required
              fullWidth
              variant="outlined"
              placeholder="メールアドレスを入力してください"
              defaultValue={user?.email || ""}
            />
            <FormHelperText>
              メールアドレスはtemp_を削除し、(所属期).xxxxx@uniproject.jpの形式としてください。
            </FormHelperText>
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
            <FormHelperText>
              メールボックスのパスワードは初期パスワードとしてメンバーに通知されます。
              <br />
              さくらのメールボックスで操作してから承認してください。
            </FormHelperText>
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button onClick={handleClose} disabled={isPending}>
              キャンセル
            </Button>
            <Button variant="contained" type="submit" disabled={isPending}>
              承認
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </SnackbarProvider>
  );
}
