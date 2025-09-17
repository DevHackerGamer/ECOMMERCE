import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "../../../lib/data";
import { adminListOrders } from "../../../lib/dataAdmin";
import { isAdminRequest } from "../../../lib/adminAuth";

export async function GET(req: NextRequest) {
  // Admin-only listing
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await adminListOrders();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  // Public create
  const body = await req.json();
  const id = await createOrder(body);
  return NextResponse.json({ id });
}
