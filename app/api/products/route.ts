import { NextRequest, NextResponse } from "next/server";
import { listProducts, listProductsPaged } from "../../../lib/data";
import { adminCreateProduct } from "../../../lib/dataAdmin";
import { isAdminRequest } from "../../../lib/adminAuth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');
  const hasPaging = !!(pageStr || limitStr);
  if (hasPaging) {
    const page = Math.max(parseInt(pageStr || '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limitStr || '10', 10) || 10, 1), 50);
    const result = await listProductsPaged({ page, limit });
    return NextResponse.json(result);
  }
  const products = await listProducts();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  // Admin only
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = await adminCreateProduct(body);
  return NextResponse.json({ id });
}
