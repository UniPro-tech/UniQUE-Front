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
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  getStatusLabel,
  getAffiliationPeriodLabel,
} from "@/lib/constants/UserConstants";
import { UserData, UserStatus } from "@/classes/types/User";

interface UserDetailClientProps {
  user: UserData;
}

export default function UserDetailClient({ user }: UserDetailClientProps) {
  const router = useRouter();

  // ユーザーが完全なデータを持つかチェック (email, statusなど)
  const hasFullData = user.email !== undefined && user.status !== undefined;

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
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard/members")}
            sx={{ mb: 2 }}
          >
            メンバー一覧に戻る
          </Button>
          <Typography variant="h4" gutterBottom>
            ユーザー詳細
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.profile?.displayName || user.customId} の詳細情報
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
      </Box>

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {user.profile?.displayName || user.customId}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {user.status && (
                <Chip
                  label={getStatusLabel(user.status)}
                  size="small"
                  color={
                    user.status === UserStatus.ACTIVE
                      ? "success"
                      : user.status === UserStatus.SUSPENDED
                        ? "error"
                        : user.status === UserStatus.ARCHIVED
                          ? "default"
                          : "primary"
                  }
                />
              )}
              {user.affiliationPeriod && (
                <Chip
                  label={`${getAffiliationPeriodLabel(user.affiliationPeriod)}期`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {user.emailVerified && (
                <Chip label="メール認証済み" size="small" color="success" />
              )}
              {!user.profile?.isAdult && (
                <Chip label="U-18" size="small" color="warning" />
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
                <Typography variant="body1">
                  {user.customId || "未設定"}
                </Typography>
              </Box>
            </Box>

            {user.email && (
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

            {user.externalEmail && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    外部メールアドレス
                  </Typography>
                  <Typography variant="body1">{user.externalEmail}</Typography>
                </Box>
              </Box>
            )}

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
                      style={{ color: "inherit", textDecoration: "underline" }}
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
                      style={{ color: "inherit", textDecoration: "underline" }}
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

            {user.profile?.joinedAt && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    参加日
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.profile.joinedAt).toLocaleDateString(
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

      <Box>
        {user.createdAt && (
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
        {user.updatedAt && (
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
