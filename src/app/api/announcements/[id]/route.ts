import { NextResponse } from "next/server";
import { createApiClient } from "@/lib/apiClient";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const api = createApiClient();
    const res = await api.delete(`/announcements/${(await params).id}`);
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    const api = createApiClient();
    const res = await api.put(`/announcements/${(await params).id}`, body);
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
