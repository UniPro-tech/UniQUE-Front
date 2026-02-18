import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/apiClient";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    const api = createApiClient();
    const res = await api.post(`/announcements/${(await params).id}/pin`, body);
    const text = await res.text();
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status });
    } catch {
      return new NextResponse(text, { status: res.status });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "proxy_error", detail: String(err) },
      { status: 500 },
    );
  }
}
