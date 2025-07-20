"use client";
import { Stack, TextField, Button } from "@mui/material";
import { useState } from "react";
import * as crypto from "crypto";

export default function MembersContents() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [customId, setCustomId] = useState("");
  const [period, setPeriod] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password_hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    console.log({
      name,
      email,
      external_email: externalEmail,
      custom_id: customId,
      period,
      password_hash,
    });
    await fetch(`http://localhost:8080/v1/users`, {
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
  };

  return (
    <Stack justifyContent="center" alignItems="center" minHeight="100vh">
      <form onSubmit={handleSubmit} style={{ width: 320 }}>
        <Stack spacing={3}>
          <TextField
            label="カスタムID"
            value={customId}
            onChange={(e) => {
              setCustomId(e.target.value);
              setEmail(
                `${period != "0" ? `${period}.` : ""}${
                  e.target.value
                }@uniproject.jp`
              );
            }}
            required
          />
          <TextField
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="所属期"
            type="text"
            value={period}
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
            type="email"
            value={email}
            required
            fullWidth
          />
          <TextField
            label="外部メールアドレス"
            type="email"
            value={externalEmail}
            onChange={(e) => setExternalEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="パスワード"
            type="password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="パスワード（確認用）"
            type="password"
            required
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={password !== confirmPassword}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            追加
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
