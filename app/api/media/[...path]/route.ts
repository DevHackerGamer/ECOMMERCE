import { NextRequest, NextResponse } from 'next/server';
import { adminBucket } from '../../../../lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const key = Array.isArray(path) ? path.join('/') : String(path || '');
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  if (key.includes('..')) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  try {
    const file = adminBucket.file(key);
    const [exists] = await file.exists();
    if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const [metadata] = await file.getMetadata();
    const contentType = metadata?.contentType || 'application/octet-stream';
    const [buf] = await file.download();
    const ab = new ArrayBuffer(buf.byteLength);
    new Uint8Array(ab).set(buf);
    return new NextResponse(ab, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('Media proxy error', err);
    if (err?.code === 404) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Failed to load media' }, { status: 500 });
  }
}
