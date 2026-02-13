import { createApiClient } from "@/lib/apiClient";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import ConsentSettingsCardClient, { type ConsentDTO } from "./Client";

export default async function ConsentSettingsCard() {
  const authApiUrl = process.env.AUTH_API_URL || "";
  const authClient = createApiClient(authApiUrl);
  let consents: ConsentDTO[] = [];

  try {
    const res = await authClient.get("/internal/consents");
    if (res.ok) {
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data.data ?? []);
      consents = raw.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => toCamelcase(c) as ConsentDTO,
      );
    }
  } catch {
    // フェッチ失敗時は空リスト
  }

  // アプリ名解決: Resource API から application 情報を取得
  const resourceClient = createApiClient();
  const resolvedConsents = await Promise.all(
    consents.map(async (c) => {
      const appId = c.clientId || c.applicationId;
      if (!appId) return c;
      try {
        const appRes = await resourceClient.get(
          `/applications/${encodeURIComponent(appId)}`,
        );
        if (appRes.ok) {
          const app = await appRes.json();
          return {
            ...c,
            applicationName: app.name ?? appId,
            applicationDescription: app.description,
            applicationWebsiteUrl: app.website_url,
            applicationPrivacyPolicyUrl: app.privacy_policy_url,
          };
        }
      } catch {
        // ignore
      }
      return { ...c, applicationName: appId };
    }),
  );

  return <ConsentSettingsCardClient consents={resolvedConsents} />;
}
