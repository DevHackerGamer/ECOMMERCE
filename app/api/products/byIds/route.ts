import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/adminAuth';
import { adminGetProductsByIds } from '../../../../lib/dataAdmin';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    const items = await adminGetProductsByIds(ids.filter((x: any) => typeof x === 'string'));
    // Return minimal fields for chip display
    return NextResponse.json(items.map(p => ({ id: p.id, title: p.title, brand: (p as any).brand, price: (p as any).price })));
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
