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
import Base from "../Base";
import { FormStatus } from "../Base";
import { useActionState, useEffect } from "react";
import { updateAccountSettings } from "./action";
import { enqueueSnackbar } from "notistack";

export default function AccountSettingsCardClient({
  user,
  csrfToken,
}: {
  user: User;
  csrfToken: string;
}) {
  const [lastResult, action, isPending] = useActionState(
    updateAccountSettings,
    { user, status: null } as {
      user: User;
      status: FormStatus | null;
    }
  );
  useEffect(() => {
    if (lastResult.status) {
      console.log("Account settings update status:", lastResult.status);
      enqueueSnackbar(lastResult.status.message, {
        variant: lastResult.status.status,
      });
    }
  }, [lastResult.status]);
  return (
    <Base
      sid={user.id}
      action={action}
      isPending={isPending}
      csrfToken={csrfToken}
    >
      <Stack>
        <Typography variant="h5" component={"h3"}>
          基本設定
        </Typography>
        <Typography variant="body2">
          ユーザー名、メールアドレスなどの変更を行います。
        </Typography>
      </Stack>
      <TextField
        required
        label="UUID"
        defaultValue={lastResult.user.id}
        disabled
      />
      <input type="hidden" name="id" value={lastResult.user.id} />
      <TextField
        required
        label="表示名"
        defaultValue={lastResult.user.name}
        name="display_name"
      />
      <Stack>
        <TextField
          required
          label="ユーザーID"
          defaultValue={lastResult.user.customId}
          disabled
        />
        <FormHelperText>
          ユーザーIDを変更するには申請が必要です。<Link href="#">申請する</Link>
        </FormHelperText>
      </Stack>
      <Stack>
        <TextField
          required
          label="メールアドレス"
          defaultValue={lastResult.user.email}
          disabled
        />
        <FormHelperText>
          メールアドレスを変更するには申請が必要です。
          <Link href="#">申請する</Link>
        </FormHelperText>
      </Stack>
      <TextField
        required
        label="外部メールアドレス"
        defaultValue={lastResult.user.externalEmail}
        name="external_email"
      />
      <TextField
        label="所属期"
        defaultValue={lastResult.user.period!}
        disabled
      />
      <Button variant="contained" fullWidth type="submit">
        保存
      </Button>
    </Base>
  );
}
