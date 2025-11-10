"use client";
import {
  Stack,
  Typography,
  Divider,
  TextField,
  FormHelperText,
  Button,
  Link,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useActionState, useEffect } from "react";
import { updateSettings } from "./action";
import { User } from "@/types/User";
import { FormStatus } from "../../Base";

export default function PasswordSection({
  user,
  sid,
  csrfToken,
  handleClickOpen,
}: {
  user: User;
  sid: string;
  csrfToken: string;
  handleClickOpen: () => void;
}) {
  const [lastResult, action, isPending] = useActionState(
    updateSettings,
    null as null | FormStatus
  );
  useEffect(() => {
    if (lastResult) {
      enqueueSnackbar(lastResult.message, { variant: lastResult.status });
    }
  }, [lastResult]);
  return (
    <Stack component="form" action={action} spacing={2}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h6" component={"h4"}>
          パスワードの変更
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Stack>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="sid" value={sid} />
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
    </Stack>
  );
}
