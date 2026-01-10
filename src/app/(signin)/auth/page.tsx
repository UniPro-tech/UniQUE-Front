import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import ConsentCard from "@/components/mui-template/signup-side/components/ConsentCard";
import { getSession } from "@/lib/resources/Session";
import { redirect, RedirectType } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
    response_type?: string;
    nonce?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  }>;
}) {
  const params = await searchParams;
  const { client_id, redirect_uri, scope, state } = params;

  const session = await getSession();
  if (!session) {
    const query = new URLSearchParams(params as Record<string, string>);
    redirect(`/signin/auth?${query.toString()}`, RedirectType.replace);
  }

  const snacks: SnackbarData[] = [];

  const api = process.env.RESOURCE_API_URL;
  if (!client_id || !api) {
    snacks.push({ message: "不正なリクエストです。", variant: "error" });
    return (
      <>
        <TemporarySnackProvider snacks={snacks} />
        <main style={{ padding: 24 }}>
          <h1>Bad Request</h1>
          <p>不正なリクエストです。</p>
        </main>
      </>
    );
  }

  const appRes = await fetch(`${api}/apps/${client_id}`, { cache: "no-store" });
  if (!appRes.ok) {
    snacks.push({ message: "不正なクライアントIDです。", variant: "error" });
    return (
      <>
        <TemporarySnackProvider snacks={snacks} />
        <main style={{ padding: 24 }}>
          <h1>Bad Request</h1>
          <p>不正なクライアントIDです。</p>
        </main>
      </>
    );
  }

  const app = await appRes.json();

  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <ConsentCard
        app={app}
        user={session.user}
        scope={scope}
        redirect_uri={redirect_uri}
        state={state}
        action={`${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth`}
      />
    </>
  );
}
