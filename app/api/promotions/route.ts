import { NextRequest, NextResponse } from "next/server";
import { listPromotions } from "../../../lib/data";
import { adminCreatePromotion, adminListPromotions } from "../../../lib/dataAdmin";
import { isAdminRequest } from "../../../lib/adminAuth";

export async function GET(req: NextRequest) {
  if (isAdminRequest(req)) {
    const items = await adminListPromotions();
    return NextResponse.json(items);
  } else {
    const items = await listPromotions();
    return NextResponse.json(items);
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = await adminCreatePromotion(body);
  return NextResponse.json({ id });
}
