import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/paths';

// Serves files uploaded from the admin panel. (Files added to /public after `next build` aren't served by Next itself.)
const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w.-]+$/.test(name) || name.includes('..')) return new Response('Not found', { status: 404 });
  const type = TYPES[path.extname(name).toLowerCase()];
  const file = path.join(UPLOAD_DIR, name);
  if (!type || !fs.existsSync(file)) return new Response('Not found', { status: 404 });
  return new Response(fs.readFileSync(file), { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
}
