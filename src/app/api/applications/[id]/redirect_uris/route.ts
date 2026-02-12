import { NextRequest, NextResponse } from "next/server";

// Prefer RESOURCE_API_URL for resource routes; fall back to AUTH_API_URL
const RESOURCE_API_BASE =
  process.env.RESOURCE_API_URL || process.env.AUTH_API_URL || "";

async function proxyFetch(
  path: string,
  req: NextRequest,
  init: RequestInit = {},
) {
  if (!RESOURCE_API_BASE) {
    return NextResponse.json(
      { error: "RESOURCE_API_URL / AUTH_API_URL not configured" },
      { status: 500 },
    );
  }
  const url = `${RESOURCE_API_BASE}${path}`;
  const headers: HeadersInit = {};
  // forward cookies for auth
  const cookie = req.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;
  // If cookie contains server session JWT, add Authorization header for Resource API
  if (cookie && !(init.headers && (init.headers as never)["Authorization"])) {
    const match = cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("session_jwt="));
    if (match) {
      const token = match.split("=")[1] || "";
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
  }
  if (init.headers) Object.assign(headers, init.headers as HeadersInit);

  try {
    const res = await fetch(url, {
      ...init,
      headers,
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "text/plain";
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch {
    return NextResponse.json({ error: "proxy fetch failed" }, { status: 502 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // proxy to /applications/{id}/redirect_uris
  const path = `/applications/${encodeURIComponent(id)}/redirect_uris`;
  return await proxyFetch(path, req, { method: "GET" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  // POST to /applications/{id}/redirect_uris with body { uri }
  const payload = { uri: body.uri };
  return await proxyFetch(
    `/applications/${encodeURIComponent(id)}/redirect_uris`,
    req,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const uri = url.searchParams.get("uri") || "";
  const path = `/applications/${encodeURIComponent(id)}/redirect_uris?uri=${encodeURIComponent(uri)}`;
  return await proxyFetch(path, req, { method: "DELETE" });
}
