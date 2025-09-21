import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/adminAuth';
import { adminQueryProducts } from '../../../../lib/dataAdmin';

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const qRaw = searchParams.get('q');
  const q = qRaw ? qRaw.toLowerCase() : undefined;
  const limit = Number(searchParams.get('limit') || '25');
  const items = await adminQueryProducts({ q, limit });
  // Return minimal fields for typeahead
  return NextResponse.json(items.map(p => ({ id: p.id, title: p.title, brand: (p as any).brand, price: (p as any).price })));
}
