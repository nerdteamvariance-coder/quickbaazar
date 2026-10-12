import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { guard } from '@/lib/adminGuard';
import { logAction } from '@/lib/store';
import { UPLOAD_DIR } from '@/lib/paths';
// POST multipart/form-data { file } -> { url }   (images only, max 5 MB)
// Files go to /public/uploads. On serverless hosts swap this for S3 / Cloudinary and return their URL.
const OK: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif' };
export async function POST(req: Request) {
  const g = await guard(); if (typeof g !== 'string') return g;
  const form = await req.formData().catch(() => null); const f = form?.get('file');
  if (!(f instanceof File)) return NextResponse.json({ error: 'Choose an image file to upload' }, { status: 400 });
  if (!OK[f.type]) return NextResponse.json({ error: 'Only JPG, PNG, WebP, GIF or AVIF images are allowed' }, { status: 415 });
  if (f.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image is larger than 5 MB' }, { status: 413 });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${OK[f.type]}`;
  const dir = UPLOAD_DIR; fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), Buffer.from(await f.arrayBuffer()));
  logAction(g, 'uploaded', 'media', name);
  return NextResponse.json({ url: '/uploads/' + name }, { status: 201 });
}
