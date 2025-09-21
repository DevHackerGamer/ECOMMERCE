import { NextRequest, NextResponse } from "next/server";
import { adminUpdateOrder } from "../../../../lib/dataAdmin";
import { isAdminRequest } from "../../../../lib/adminAuth";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id } = await ctx.params;
  await adminUpdateOrder(id, body);
  return NextResponse.json({ ok: true });
}
