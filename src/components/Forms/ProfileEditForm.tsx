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
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import {
  updateProfile,
  UpdateProfileData,
} from "@/app/dashboard/profile/action";
import { ProfileDTO } from "@/types/User";

interface ProfileEditFormProps {
  profile?: ProfileDTO;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function ProfileEditForm({
  profile,
  onCancel,
  onSuccess,
}: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
    websiteUrl: profile?.websiteUrl || "",
    twitterHandle: profile?.twitterHandle || "",
    birthdateVisible: profile?.birthdateVisible ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    field: keyof UpdateProfileData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || "更新に失敗しました");
      }
    } catch (err) {
      setError("予期しないエラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        プロフィール編集
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              プロフィールを更新しました
            </Alert>
          )}

          <TextField
            label="表示名"
            fullWidth
            value={formData.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            helperText="あなたの表示名を入力してください"
            disabled={loading}
          />

          <TextField
            label="自己紹介"
            fullWidth
            multiline
            rows={4}
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            helperText="簡単な自己紹介を入力してください（任意）"
            disabled={loading}
          />

          <TextField
            label="ウェブサイトURL"
            fullWidth
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleChange("websiteUrl", e.target.value)}
            helperText="個人サイトやSNSのURLを入力してください（任意）"
            disabled={loading}
            placeholder="https://example.com"
          />

          <TextField
            label="Twitterハンドル"
            fullWidth
            value={formData.twitterHandle}
            onChange={(e) => handleChange("twitterHandle", e.target.value)}
            helperText="@なしのTwitterユーザー名を入力してください（任意）"
            disabled={loading}
            placeholder="username"
          />

          {profile?.birthdate && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                誕生日:{" "}
                {new Date(profile.birthdate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.birthdateVisible || false}
                    onChange={(e) =>
                      handleChange("birthdateVisible", e.target.checked)
                    }
                    disabled={loading}
                  />
                }
                label="誕生日を公開する"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                誕生日の公開/非公開を選択できます
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {onCancel && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                disabled={loading}
              >
                キャンセル
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={20} /> : <SaveIcon />
              }
              disabled={loading}
            >
              {loading ? "保存中..." : "保存"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
