import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "../../../../lib/data";
import { adminUpdateProduct, adminDeleteProduct } from "../../../../lib/dataAdmin";
import { isAdminRequest } from "../../../../lib/adminAuth";

export async function GET(_req: NextRequest, { params }: any) {
  const item = await getProduct(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: any) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await adminUpdateProduct(params.id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: any) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await adminDeleteProduct(params.id);
  return NextResponse.json({ ok: true });
}
