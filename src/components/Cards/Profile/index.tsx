"use client";

import { Box, Button, Card, Stack, Typography, Chip } from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Web as WebIcon,
  Cake as CakeIcon,
  X as XIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  getStatusLabel,
  getAffiliationPeriodLabel,
} from "@/constants/UserConstants";
import { UserData, UserStatus } from "@/classes/types/User";
import { useState } from "react";
import ProfileEditForm from "@/components/Forms/ProfileEditForm";
import { SnackbarProvider } from "notistack";

interface ProfileProps {
  user: UserData;
  /** 'self' は編集ボタン表示など自分用の表示。'detail' は戻るボタンなど管理者向けの表示 */
  variant?: "self" | "detail";
  onEdit?: () => void;
  onBack?: () => void;
  showTimestamps?: boolean;
}

export default function Profile({
  user,
  variant = "self",
  onBack,
  showTimestamps = false,
}: ProfileProps) {
  const router = useRouter();

  const [userProfile, setUserProfile] = useState(user.profile);

  const hasFullData = user?.email !== undefined || user?.status !== undefined;

  const [editMode, setEditMode] = useState(false);

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
          {variant === "detail" && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => (onBack ? onBack() : router.back())}
              sx={{ mb: 2 }}
            >
              メンバー一覧に戻る
            </Button>
          )}
          <Typography variant="h4" gutterBottom>
            {variant === "self" ? "プロフィール" : "ユーザー詳細"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userProfile?.displayName || user?.customId} の情報
          </Typography>
          {!hasFullData && (
            <Chip
              label="公開情報のみ表示中"
              size="small"
              color="warning"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        {variant === "self" && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            編集
          </Button>
        )}
      </Box>

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {userProfile?.displayName || user?.customId}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {user?.status && (
                <Chip
                  label={
                    typeof user.status === "string"
                      ? user.status
                      : getStatusLabel(user.status as UserStatus)
                  }
                  size="small"
                  color={
                    user?.status === UserStatus.ACTIVE
                      ? "success"
                      : user?.status === UserStatus.SUSPENDED
                        ? "error"
                        : user?.status === UserStatus.ARCHIVED
                          ? "default"
                          : "primary"
                  }
                />
              )}

              {user?.affiliationPeriod && (
                <Chip
                  label={`${getAffiliationPeriodLabel(
                    user.affiliationPeriod as unknown as string | null,
                  )}期`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}

              {user?.emailVerified && (
                <Chip label="メール認証済み" size="small" color="success" />
              )}

              {userProfile && userProfile.isAdult === false && (
                <Chip label="U-18" size="small" color="warning" />
              )}
            </Stack>
          </Box>

          {editMode ? (
            <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
              <ProfileEditForm
                profile={userProfile}
                onCancel={() => setEditMode(false)}
                onSuccess={() => {
                  setEditMode(false);
                }}
                setProfile={setUserProfile}
              />
            </SnackbarProvider>
          ) : (
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    表示名
                  </Typography>
                  <Typography variant="body1">
                    {userProfile?.displayName || "未設定"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BadgeIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    カスタムID
                  </Typography>
                  <Typography variant="body1">
                    {user?.customId || "未設定"}
                  </Typography>
                </Box>
              </Box>

              {user?.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      メールアドレス
                    </Typography>
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>
                </Box>
              )}

              {user?.externalEmail && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      外部メールアドレス
                    </Typography>
                    <Typography variant="body1">
                      {user.externalEmail}
                    </Typography>
                  </Box>
                </Box>
              )}

              {userProfile?.bio && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    自己紹介
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
                  >
                    {userProfile.bio}
                  </Typography>
                </Box>
              )}

              {userProfile?.websiteUrl && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WebIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ウェブサイト
                    </Typography>
                    <Typography variant="body1">
                      <a
                        href={userProfile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "inherit",
                          textDecoration: "underline",
                        }}
                      >
                        {userProfile.websiteUrl}
                      </a>
                    </Typography>
                  </Box>
                </Box>
              )}

              {userProfile?.twitterHandle && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <XIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Twitter (X)
                    </Typography>
                    <Typography variant="body1">
                      <a
                        href={`https://twitter.com/${userProfile.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "inherit",
                          textDecoration: "underline",
                        }}
                      >
                        @{userProfile.twitterHandle}
                      </a>
                    </Typography>
                  </Box>
                </Box>
              )}

              {userProfile?.birthdate && userProfile?.birthdateVisible && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CakeIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      誕生日
                    </Typography>
                    <Typography variant="body1">
                      {new Date(userProfile.birthdate).toLocaleDateString(
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

              {userProfile?.joinedAt && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      参加日
                    </Typography>
                    <Typography variant="body1">
                      {new Date(userProfile.joinedAt).toLocaleDateString(
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
          )}
        </Stack>
      </Card>

      <Box>
        {showTimestamps && user?.createdAt && (
          <Typography variant="caption" color="text.secondary" display="block">
            アカウント作成日:{" "}
            {new Date(user.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        )}

        {showTimestamps && user?.updatedAt && (
          <Typography variant="caption" color="text.secondary" display="block">
            最終更新日:{" "}
            {new Date(user.updatedAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
