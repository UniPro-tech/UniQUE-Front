import RedirectUrisClient from "./Client";
import { toCamelcase } from "@/lib/SnakeCamlUtil";

export default async function RedirectUris({
  applicationId,
}: {
  applicationId: string;
}) {
  let uris: string[] = [];

  try {
    // use local proxy route so server and client behave the same
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/applications/${encodeURIComponent(
      applicationId,
    )}/redirect_uris`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { cookie: cookieHeader },
    });
    if (res.ok) {
      const data = (await res.json()) as unknown;
      const raw = Array.isArray(data)
        ? data
        : ((data as Record<string, unknown>).data ?? []);
      uris = (raw as Record<string, string>[])
        .map(
          (r: Record<string, string>) =>
            (toCamelcase(r) as Record<string, string>).uri,
        )
        .filter(Boolean);
    }
  } catch (err) {
    // ignore fetch errors; client will handle
  }

  return (
    <RedirectUrisClient applicationId={applicationId} initialUris={uris} />
  );
}
