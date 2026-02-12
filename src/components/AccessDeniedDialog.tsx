"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

interface AccessDeniedDialogProps {
  /** アクセスが拒否されたリソース名 */
  resourceName?: string;
  /** エラーコード */
  errorCode?: string;
  /** 詳細なエラーメッセージ */
  detailedMessage?: string;
  /** 戻るボタンの遷移先（デフォルト=/dashboard） */
  redirectUrl?: string;
  /** より詳しい情報へのリンク */
  supportUrl?: string;
}

/**
 * Access Denied時の表示コンポーネント
 * fullPage: True（ページ全体表示）、False（ダイアログ/カード表示）
 */
export default function AccessDeniedDialog({
  resourceName = "このリソース",
  errorCode = "B0001",
  detailedMessage,
  redirectUrl = "/dashboard",
  supportUrl,
}: AccessDeniedDialogProps) {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: "100%",
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          {/* アイコン */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <LockIcon
              sx={{
                fontSize: 64,
                color: "error.main",
              }}
            />
          </Box>

          {/* タイトル */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            アクセス権限がありません
          </Typography>

          {/* 説明 */}
          <Stack spacing={2} sx={{ my: 3 }}>
            <Typography variant="body1" color="textSecondary">
              申し訳ありません。{resourceName}
              へのアクセス権限がないものと思われます。
            </Typography>

            {/* 詳細メッセージ */}
            {detailedMessage && (
              <Alert severity="info">{detailedMessage}</Alert>
            )}

            {/* エラーコード */}
            <Typography variant="caption" color="textSecondary">
              エラーコード: {errorCode}
            </Typography>
          </Stack>

          {/* アクション */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              component={Link}
              href={redirectUrl}
              variant="contained"
              fullWidth
              startIcon={<HomeIcon />}
            >
              ダッシュボードへ戻る
            </Button>
          </Stack>

          {/* サポート링ク */}
          {supportUrl && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2">
                <Link href={supportUrl} style={{ color: "inherit" }}>
                  援助が必要な場合はこちらをご覧ください
                </Link>
              </Typography>
            </Box>
          )}
        </Card>

        {/* 権限グループへの連絡促進 */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            権限が必要な場合は、プロジェクト管理者にお問い合わせください。
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

/**
 * Access Denied用のコンパクト版ダイアログ（モーダル内で使用）
 */
export function AccessDeniedAlert({
  resourceName = "このアクション",
  onDismiss,
}: {
  resourceName?: string;
  onDismiss?: () => void;
}) {
  return (
    <Alert severity="error" onClose={onDismiss} sx={{ mb: 2 }}>
      <Typography variant="body2" component="div">
        <strong>{resourceName}を実行する権限がありません。</strong>
      </Typography>
      <Typography variant="caption" component="div" sx={{ mt: 1 }}>
        プロジェクト管理者に権限の付与をリクエストしてください。
      </Typography>
    </Alert>
  );
}
