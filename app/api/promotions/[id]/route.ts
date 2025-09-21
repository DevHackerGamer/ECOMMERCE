import { NextRequest, NextResponse } from "next/server";
import { getPromotion } from "../../../../lib/data";
import { adminUpdatePromotion, adminDeletePromotion } from "../../../../lib/dataAdmin";
import { isAdminRequest } from "../../../../lib/adminAuth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = await getPromotion(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id } = await ctx.params;
  await adminUpdatePromotion(id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await adminDeletePromotion(id);
  return NextResponse.json({ ok: true });
}
