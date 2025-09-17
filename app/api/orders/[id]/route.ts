import { NextRequest, NextResponse } from "next/server";
import { adminUpdateOrder } from "../../../../lib/dataAdmin";
import { isAdminRequest } from "../../../../lib/adminAuth";

export async function PUT(req: NextRequest, { params }: any) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await adminUpdateOrder(params.id, body);
  return NextResponse.json({ ok: true });
}
