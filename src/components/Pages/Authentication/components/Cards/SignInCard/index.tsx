import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SitemarkIcon } from "../../CustomIcons";
import { Card } from "../Base";
import { useInitialFormState } from "../../../Client";
import { submitSignIn } from "../../actions/signIn";
import ForgotPassword from "../../ForgotPassword";

export default function SignUpCard() {
  const initialState = useInitialFormState();

  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateInputs = () => {
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!password.value) {
      setPasswordError(true);
      setPasswordErrorMessage("パスワードを入力してください。");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        サインイン
      </Typography>
      <Typography sx={{ textAlign: "left" }}>
        メンバーではありませんか？{" "}
        <span>
          <Link href="/signup" variant="body2" sx={{ alignSelf: "center" }}>
            サインアップ
          </Link>
        </span>
      </Typography>
      <Typography sx={{ textAlign: "left" }}>
        既存メンバーですか？{" "}
        <span>
          <Link href="/migrate" variant="body2" sx={{ alignSelf: "center" }}>
            アカウント移行
          </Link>
        </span>
      </Typography>
      <Box
        component="form"
        noValidate
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
        action={submitSignIn}
      >
        <FormControl>
          <FormLabel htmlFor="username">ユーザー名</FormLabel>
          <TextField
            id="username"
            type="text"
            name="username"
            placeholder="your_username"
            defaultValue={initialState?.username}
            autoComplete="username"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={"primary"}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormLabel htmlFor="password">パスワード</FormLabel>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "baseline" }}
            >
              パスワードをお忘れですか？
            </Link>
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? "error" : "primary"}
          />
        </FormControl>
        <ForgotPassword open={open} handleClose={handleClose} />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label={"ログイン状態を保持する"}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          onClick={validateInputs}
        >
          サインイン
        </Button>
      </Box>
    </Card>
  );
}
