import { apiPost } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const backendRes = await apiPost(`/roles/${id}/assign_all`, {});
    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        "Content-Type":
          backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Proxy error", detail: String(err) },
      { status: 500 },
    );
  }
}
