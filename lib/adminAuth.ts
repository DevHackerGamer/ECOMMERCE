import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "bd_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
  return s;
}

function sign(value: string) {
  const h = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${h}`;
}

function verify(signed: string) {
  const i = signed.lastIndexOf(".");
  if (i === -1) return null;
  const value = signed.slice(0, i);
  const mac = signed.slice(i + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return value;
}

export function isAdminRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return Boolean(verify(token));
}

export function setAdminCookie(res: NextResponse) {
  const token = sign(`ok:${Date.now()}`);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, maxAge: 0, path: "/" });
}

export function requireAdmin(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
