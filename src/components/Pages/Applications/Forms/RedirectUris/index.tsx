import { Application } from "@/classes/Application";
import RedirectUrisClient from "./Client";
import { SnackbarProvider } from "notistack";

export default async function RedirectUris({
  application,
}: {
  application: Application;
}) {
  const redirectUris = await application.getRedirectUris();

  return (
    <RedirectUrisClient
      application={await application.toJson()}
      initialUris={redirectUris}
    />
  );
}
