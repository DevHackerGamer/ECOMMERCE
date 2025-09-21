import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '../../../lib/adminAuth';
import { adminBucket } from '../../../lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const folder = (url.searchParams.get('folder') || 'products').replace(/[^a-zA-Z0-9_\/-]/g, '').replace(/^[./]+/, '');

  const formData = await req.formData();
  const files = formData.getAll('files');
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files' }, { status: 400 });
  }

  try {
    const uploads: string[] = [];
    for (const f of files) {
      if (!(f instanceof File)) continue;
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = f.type || 'application/octet-stream';
      const filename = f.name || 'upload';
  const key = `${folder || 'products'}/${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;

      const fileRef = adminBucket.file(key);
      await fileRef.save(buffer, {
        contentType,
        resumable: false,
        metadata: {
          contentType,
          // Keep room for custom metadata if needed later.
          metadata: {},
        },
      });
      // Serve via our own media proxy to avoid Firebase v0 bucket/linking constraints
      const localUrl = `/api/media/${key}`;
      uploads.push(localUrl);
    }

    return NextResponse.json({ urls: uploads });
  } catch (err: any) {
    console.error('Upload error', err);
    if (err?.code === 404 || /does not exist/i.test(String(err?.message))) {
      return NextResponse.json({ error: 'Storage bucket not found. Ensure FIREBASE_STORAGE_BUCKET (or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) is set to your appspot.com bucket and that the bucket exists.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
