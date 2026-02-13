import { NextResponse } from "next/server";
import { Application } from "@/types/Application";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const { id } = params;
  try {
    const body = await request.json();

    const app = await Application.getApplicationById(id);
    if (!app) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 },
      );
    }

    app.name = body.name ?? app.name;
    app.description = body.description ?? app.description;
    app.websiteUrl = body.websiteUrl ?? app.websiteUrl;
    app.privacyPolicyUrl = body.privacyPolicyUrl ?? app.privacyPolicyUrl;

    if (body.clientSecret) {
      app.clientSecret = body.clientSecret;
    }

    await app.save();

    return NextResponse.json({ ok: true, application: app.toPlainObject() });
  } catch (err) {
    console.error("/api/applications/[id] PATCH error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const { id } = params;
  try {
    const app = await Application.getApplicationById(id);
    if (!app) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 },
      );
    }

    await app.delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/applications/[id] DELETE error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
