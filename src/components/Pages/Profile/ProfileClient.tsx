"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Card, Stack, Typography, Chip } from "@mui/material";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Web as WebIcon,
  Cake as CakeIcon,
  X as XIcon,
} from "@mui/icons-material";
import ProfileEditForm from "@/components/Forms/ProfileEditForm";
import { UserDTO } from "@/types/User";

interface ProfileClientProps {
  user: UserDTO;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    router.refresh();
  };

  const handleSuccess = () => {
    setIsEditing(false);
    router.refresh();
  };

  if (isEditing) {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            プロフィール編集
          </Typography>
          <Typography variant="body2" color="text.secondary">
            あなたのプロフィール情報を編集できます
          </Typography>
        </Box>

        <ProfileEditForm
          profile={user.profile}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            プロフィール
          </Typography>
          <Typography variant="body2" color="text.secondary">
            あなたのプロフィール情報を確認できます
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEditClick}
        >
          編集
        </Button>
      </Box>

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {user.profile?.displayName || user.customId}
            </Typography>
            <Stack direction="row" spacing={1}>
              {user.status && (
                <Chip
                  label={user.status}
                  size="small"
                  color={user.status === "active" ? "success" : "default"}
                />
              )}
              {user.affiliationPeriod && (
                <Chip
                  label={user.affiliationPeriod}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Box>

          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  表示名
                </Typography>
                <Typography variant="body1">
                  {user.profile?.displayName || "未設定"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BadgeIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  カスタムID
                </Typography>
                <Typography variant="body1">{user.customId}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  メールアドレス
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
            </Box>

            {user.profile?.bio && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  自己紹介
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
                >
                  {user.profile.bio}
                </Typography>
              </Box>
            )}

            {user.profile?.websiteUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WebIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ウェブサイト
                  </Typography>
                  <Typography variant="body1">
                    <a
                      href={user.profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      {user.profile.websiteUrl}
                    </a>
                  </Typography>
                </Box>
              </Box>
            )}

            {user.profile?.twitterHandle && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <XIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Twitter (X)
                  </Typography>
                  <Typography variant="body1">
                    <a
                      href={`https://twitter.com/${user.profile.twitterHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      @{user.profile.twitterHandle}
                    </a>
                  </Typography>
                </Box>
              </Box>
            )}

            {user.profile?.birthdate && user.profile?.birthdateVisible && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CakeIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    誕生日
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.profile.birthdate).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Stack>
      </Card>

      {user.createdAt && (
        <Typography variant="caption" color="text.secondary">
          アカウント作成日:{" "}
          {new Date(user.createdAt).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      )}
    </Stack>
  );
}
