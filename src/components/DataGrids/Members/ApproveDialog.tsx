import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FormStatus } from "@/components/Pages/Settings/Cards/Base";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import { FormHelperText, MenuItem, TextField, Typography } from "@mui/material";
import PeriodSelectorOptions from "@/components/PeriodSelectorOptions";
import { UserData } from "@/classes/types/User";
import { approveAction } from "./actions/approveAction";
import {
  AFFILIATION_PERIOD_OPTIONS,
  getAffiliationPeriodInfo,
} from "@/constants/UserConstants";

interface ApproveRegistApplyProps {
  open: boolean;
  handleClose: () => void;
  user: UserData | null;
}

export default function ApproveRegistApplyDialog({
  open,
  handleClose,
  user,
}: ApproveRegistApplyProps) {
  const [state, action, isPending] = React.useActionState(
    approveAction,
    null as null | FormStatus,
  );
  React.useEffect(() => {
    if (state) {
      enqueueSnackbar(state.message, { variant: state.status });
      handleClose();
    }
  }, [handleClose, state]);

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
            <PeriodSelectorOptions />
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
              select
              label="所属期 (任意)"
              fullWidth
              helperText="所属期を選択（任意）"
              name="period"
            >
              {AFFILIATION_PERIOD_OPTIONS.map((opt) => {
                const info = getAffiliationPeriodInfo(opt.value);
                return (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Typography>{opt.value}期</Typography>
                    <Typography
                      variant="caption"
                      sx={{ ml: 1, color: "text.secondary" }}
                    >
                      ({info.year}年度 {info.label})
                    </Typography>
                  </MenuItem>
                );
              })}
            </TextField>
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
