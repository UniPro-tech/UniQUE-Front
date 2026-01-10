"use client";
import {
  Stack,
  Typography,
  Divider,
  Button,
  List,
  Chip,
  ListItem,
  Card,
  Box,
} from "@mui/material";
import { logoutSession } from "./action";
import { Session } from "@/lib/resources/Session";
import { parseUA } from "@/lib/UserAgent";
import { useActionState, useEffect, useState } from "react";
import { FormStatus } from "../../Base";
import { enqueueSnackbar } from "notistack";

export default function SessionsSection({
  current_id,
  sessions,
  csrfToken,
}: {
  current_id: string;
  sessions: Session[];
  csrfToken: string;
}) {
  const [latestResult, action, isPending] = useActionState(logoutSession, {
    sessions,
    status: null as null | FormStatus,
  });
  useEffect(() => {
    if (latestResult.status) {
      enqueueSnackbar(latestResult.status.message, {
        variant: latestResult.status.status,
      });
    }
  }, [latestResult]);
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h6" component={"h4"}>
          セッション管理
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Stack>
      <List
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {latestResult.sessions.map((session) => (
          <ListItem key={session.id} disablePadding>
            <Card
              sx={{
                p: 2,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body1">
                    {parseUA(session.userAgent).browser} -{" "}
                    {parseUA(session.userAgent).os}{" "}
                  </Typography>
                  {session.id === current_id ? (
                    <Chip
                      label="現在のセッション"
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  ) : null}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  IPアドレス: {session.ipAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  登録日: {new Date(session.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box component="form" action={action} method="post">
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="id" value={session.id} />
                <Button
                  type="submit"
                  variant="outlined"
                  size="small"
                  color={session.id === current_id ? "warning" : "error"}
                >
                  ログアウト
                </Button>
              </Box>
            </Card>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
