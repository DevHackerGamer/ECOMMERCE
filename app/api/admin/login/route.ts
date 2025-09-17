import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie } from "../../../../lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  if (password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setAdminCookie(res);
  return res;
}
