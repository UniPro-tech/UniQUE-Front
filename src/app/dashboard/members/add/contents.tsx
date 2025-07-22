"use client";
import {
  Stack,
  TextField,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useActionState, useState } from "react";
import * as crypto from "crypto";
import { redirect } from "next/navigation";

export default function MembersContents() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [customId, setCustomId] = useState("");
  const [period, setPeriod] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  type FormType = {
    name: string;
    email: string;
    external_email: string;
    custom_id: string;
    period: string;
    password: string;
    confirm_password: string;
  };
  type FormErrorStatus = {
    success: boolean;
    error: string | null;
  };
  const initialFormData: FormErrorStatus = {
    success: false,
    error: null,
  };
  const formAction = async (state: FormErrorStatus, newData: FormData) => {
    const values = Object.fromEntries(newData.entries()) as FormType;
    const { name, email, external_email, custom_id, period, password } = values;
    const password_hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    console.log({
      name,
      email,
      external_email,
      custom_id,
      period,
      password_hash,
    });
    const response = await fetch(`http://localhost:8080/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        external_email: externalEmail,
        custom_id: customId,
        period,
        password_hash,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      setOpenState(true);
      return { success: false, error: error.message };
    } else {
      const data = await response.json();
      console.log("User created successfully:", data);
      successRedirect();
      setOpenState(true);
      return { success: true, error: null };
    }
  };

  const successRedirect = async () => {
    await new Promise((res) => setTimeout(res, 2400));
    redirect("/members");
  };

  const [formData, action, isPending] = useActionState(
    formAction,
    initialFormData
  );

  const [openState, setOpenState] = useState<boolean>(false);

  const handleClose = () => {
    setOpenState(false);
  };

  return (
    <Stack justifyContent="center" alignItems="center" minHeight="100vh">
      {isPending ? (
        <>
          <LinearProgress />
        </>
      ) : (
        <form action={action} style={{ width: 320 }}>
          <Stack spacing={3}>
            <TextField
              label="カスタムID"
              name="custom_id"
              onChange={(e) => {
                setCustomId(e.target.value);
                setEmail(
                  `${period != "0" ? `${period}.` : ""}${
                    e.target.value
                  }@uniproject.jp`
                );
              }}
              value={customId}
              disabled={formData.success}
              required
            />
            <TextField
              label="名前"
              name="name"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              disabled={formData.success}
              required
              fullWidth
            />
            <TextField
              label="所属期"
              name="period"
              type="text"
              value={period}
              disabled={formData.success}
              onChange={(e) => {
                setPeriod(e.target.value);
                setEmail(
                  `${
                    e.target.value != "0" ? `${e.target.value}.` : ""
                  }${customId}@uniproject.jp`
                );
              }}
              required
              fullWidth
            />
            <TextField
              label="メール"
              name="email"
              type="email"
              disabled={formData.success}
              required
              fullWidth
              value={email}
            />
            <TextField
              label="外部メールアドレス"
              name="external_email"
              type="email"
              disabled={formData.success}
              value={externalEmail}
              onChange={(e) => setExternalEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="パスワード"
              name="password"
              type="password"
              disabled={formData.success}
              value={password}
              required
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="パスワード（確認用）"
              name="confirm_password"
              type="password"
              value={confirmPassword}
              disabled={formData.success}
              required
              fullWidth
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={password !== confirmPassword}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={formData.success}
            >
              追加
            </Button>
            {formData.error && (
              <Snackbar
                open={openState}
                onClose={handleClose}
                autoHideDuration={6000}
              >
                <Alert
                  onClose={handleClose}
                  severity="error"
                  variant="filled"
                  sx={{ width: "100%" }}
                >
                  ユーザーの追加に失敗しました: {formData.error}
                </Alert>
              </Snackbar>
            )}
            {formData.success && (
              <Snackbar
                open={openState}
                onClose={handleClose}
                autoHideDuration={2400}
              >
                <Alert
                  onClose={handleClose}
                  severity="success"
                  variant="filled"
                  sx={{ width: "100%" }}
                >
                  ユーザーの追加に成功しました
                </Alert>
              </Snackbar>
            )}
          </Stack>
        </form>
      )}
    </Stack>
  );
}
