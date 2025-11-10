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
import { SnackbarProvider } from "notistack";

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
          {user.discords ? (
            <List>
              {user.discords.map((discord) => (
                <ListItem key={discord.id}>
                  <Typography variant="body2">
                    {discord.discordCustomid} (ID: {discord.discordId})
                  </Typography>
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
