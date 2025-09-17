import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "../../../lib/data";
import { adminCreateProduct } from "../../../lib/dataAdmin";
import { isAdminRequest } from "../../../lib/adminAuth";

export async function GET() {
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
