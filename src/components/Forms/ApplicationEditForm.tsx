"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import type { PlainApplication } from "@/types/Application";

interface ApplicationEditFormProps {
  application: PlainApplication;
  owner?: {
    displayName: string;
    customId: string;
    email: string;
  };
}

interface UpdateApplicationFormData {
  name: string;
  description: string;
  websiteUrl: string;
  privacyPolicyUrl: string;
}

export default function ApplicationEditForm({
  application,
  owner,
}: ApplicationEditFormProps) {
  const generateClientSecret = () => {
    // ランダムな64文字の英数字文字列を生成
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [formData, setFormData] = useState<UpdateApplicationFormData>({
    name: application.name || "",
    description: application.description || "",
    websiteUrl: application.websiteUrl || "",
    privacyPolicyUrl: application.privacyPolicyUrl || "",
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (
    field: keyof UpdateApplicationFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleCopySecret = async () => {
    if (!clientSecret) return;
    try {
      await navigator.clipboard.writeText(clientSecret);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRegenerateSecret = () => {
    setClientSecret(generateClientSecret());
    setCopySuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // バリデーション
    if (!formData.name.trim()) {
      setError("アプリケーション名を入力してください");
      setLoading(false);
      return;
    }

    try {
      const { Application } = await import("@/types/Application");
      const app = await Application.getApplicationById(application.id);

      // Update the application
      app.name = formData.name;
      app.description = formData.description;
      app.websiteUrl = formData.websiteUrl;
      app.privacyPolicyUrl = formData.privacyPolicyUrl;

      // クライアントシークレットが再生成されている場合のみ含める
      if (clientSecret) {
        app.clientSecret = clientSecret;
      }

      await app.save();
      setSuccess(true);
      // 保存後はシークレットをリセット
      setClientSecret(null);
      setCopySuccess(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 4 }}>
      <Stack spacing={4}>
        {/* アプリケーション情報セクション */}
        <Box>
          <Typography variant="h6" gutterBottom>
            アプリケーション情報
          </Typography>
          <Stack
            spacing={2}
            sx={{ mt: 2 }}
            direction={{ xs: "column", sm: "row" }}
          >
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                アプリケーションID (クライアントID)
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  mt: 0.5,
                }}
              >
                {application.id}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                所有者
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  mt: 0.5,
                }}
              >
                {owner ? `${owner.displayName} (@${owner.customId})` : "不明"}
              </Typography>
            </Paper>
          </Stack>
        </Box>

        <Divider />

        {/* クライアントシークレット管理セクション */}
        <Box>
          <Typography variant="h6" gutterBottom>
            クライアントシークレット管理
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {clientSecret === null ? (
              <Button
                variant="outlined"
                color="warning"
                onClick={handleRegenerateSecret}
                disabled={loading}
                sx={{ cursor: "pointer" }}
              >
                シークレットを再生成
              </Button>
            ) : (
              <Stack spacing={1}>
                <TextField
                  label="新しいクライアントシークレット"
                  fullWidth
                  required
                  value={clientSecret}
                  helperText="新しく生成されたシークレット（保存時に更新されます）"
                  disabled={true}
                  type="password"
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleCopySecret}
                            edge="end"
                            title={copySuccess ? "コピーしました!" : "コピー"}
                            disabled={loading}
                          >
                            <ContentCopyIcon
                              sx={{
                                color: copySuccess ? "success.main" : "inherit",
                              }}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRegenerateSecret}
                  disabled={loading}
                  sx={{
                    cursor: loading ? "progress" : "pointer",
                  }}
                >
                  別のシークレットを生成
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* 編集フォームセクション */}
        <Box>
          <Typography variant="h6" gutterBottom>
            基本情報編集
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2 }}
          >
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" onClose={() => setSuccess(false)}>
                  アプリケーションを更新しました
                </Alert>
              )}

              <TextField
                label="アプリケーション名"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                helperText="アプリケーションの名前を入力してください"
                disabled={loading}
              />

              <TextField
                label="説明"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                helperText="アプリケーションの説明を入力してください（任意）"
                disabled={loading}
              />

              <TextField
                label="Webサイト URL"
                fullWidth
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleChange("websiteUrl", e.target.value)}
                helperText="アプリケーションのWebサイトURL（任意）"
                disabled={loading}
              />

              <TextField
                label="プライバシーポリシー URL"
                fullWidth
                type="url"
                value={formData.privacyPolicyUrl}
                onChange={(e) =>
                  handleChange("privacyPolicyUrl", e.target.value)
                }
                helperText="プライバシーポリシーのURL（任意）"
                disabled={loading}
              />

              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ pt: 2 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  disabled={loading}
                >
                  {loading ? "保存中..." : "変更を保存"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
