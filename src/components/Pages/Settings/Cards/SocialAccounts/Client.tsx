"use client";
import {
  Button,
  Card,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { User } from "@/types/User";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import { unlink } from "@/lib/resources/SocialAccounts";

export default function SocialAccountsCardClient({
  user,
  csrfToken,
}: {
  user: User;
  csrfToken: string;
}) {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
      <SnackbarProvider maxSnack={3} autoHideDuration={6000}>
        <Card
          variant="outlined"
          sx={{
            display: "flex",
            p: 2,
            pb: 5,
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" component={"h3"}>
            ソーシャルアカウント設定
          </Typography>
          <Typography variant="body2">
            ソーシャルアカウントの連携設定を行います。
          </Typography>
          <Stack direction={"row"} alignItems="center" spacing={1}>
            <Typography variant="h6" textAlign={"left"}>
              Discordアカウント
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Stack>
          {user.discords?.length !== 0 ? (
            <List>
              {user.discords!.map((discord) => (
                <ListItem key={discord.discordId}>
                  <Typography variant="body2">
                    {discord.customId} (ID: {discord.discordId})
                  </Typography>
                  <Button
                    onClick={() =>
                      unlink("discord", discord.discordId)
                        .then(() => {
                          enqueueSnackbar(
                            "Discordアカウントの連携を解除しました。",
                            { variant: "success" }
                          );
                        })
                        .catch((error) => {
                          enqueueSnackbar(
                            `Discordアカウントの連携解除に失敗しました: ${error.message}`,
                            { variant: "error" }
                          );
                        })
                    }
                  >
                    連携解除
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2">
              現在、Discordアカウントは連携されていません。
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            href={`/api/oauth/discord`}
            sx={{
              maxWidth: 300,
            }}
          >
            Discordアカウントを連携する
          </Button>
        </Card>
      </SnackbarProvider>
    </SnackbarProvider>
  );
}
