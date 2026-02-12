import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import ConsentCard from "@/components/mui-template/signup-side/components/ConsentCard";
import { createApiClient } from "@/lib/apiClient";
import Session from "@/types/Session";
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
    auth_request_id?: string;
  }>;
}) {
  const params = await searchParams;
  const { client_id, redirect_uri, scope, state, auth_request_id } = params;

  const session = await (await Session.get())?.convertPlain();
  if (!session) {
    const query = new URLSearchParams(params as Record<string, string>);
    redirect(`/signin/auth?${query.toString()}`, RedirectType.replace);
  }

  const snacks: SnackbarData[] = [];

  if (!client_id) {
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

  const apiClient = createApiClient();
  const appRes = await apiClient.get(
    `/applications/${encodeURIComponent(client_id)}`,
  );
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

  // 既存の同意があるかチェック – あればコンセント画面をスキップ
  // Resolve auth API URL from public or server env, fallback to localhost
  const resolvedAuthApiUrl =
    process.env.NEXT_PUBLIC_AUTH_API_URL ||
    process.env.AUTH_API_URL ||
    "http://localhost:8001";
  const authClient = createApiClient(resolvedAuthApiUrl);
  try {
    const consentsRes = await authClient.get(`/internal/consents`);
    if (consentsRes.ok) {
      const consentsData = await consentsRes.json();
      const consents: { client_id?: string; application_id?: string }[] =
        Array.isArray(consentsData) ? consentsData : (consentsData.data ?? []);
      const hasConsent = consents.some(
        (c) => c.client_id === client_id || c.application_id === client_id,
      );

      if (hasConsent) {
        // 同意済み → 認可エンドポイントへ直接リダイレクト
        const authQuery = new URLSearchParams();
        authQuery.set("client_id", client_id);
        authQuery.set("redirect_uri", redirect_uri);
        if (scope) authQuery.set("scope", scope);
        if (state) authQuery.set("state", state);
        if (params.response_type)
          authQuery.set("response_type", params.response_type);
        if (params.nonce) authQuery.set("nonce", params.nonce);
        if (params.code_challenge)
          authQuery.set("code_challenge", params.code_challenge);
        if (params.code_challenge_method)
          authQuery.set("code_challenge_method", params.code_challenge_method);

        redirect(
          `${resolvedAuthApiUrl}/authorization?${authQuery.toString()}`,
          RedirectType.replace,
        );
      }
    }
  } catch {
    // 同意チェックに失敗した場合はフォールスルーして同意画面を表示
  }

  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <ConsentCard
        app={app}
        user={session.user}
        scope={scope}
        redirect_uri={redirect_uri}
        state={state}
        auth_request_id={auth_request_id}
        action={`${resolvedAuthApiUrl}/authorization`}
      />
    </>
  );
}
