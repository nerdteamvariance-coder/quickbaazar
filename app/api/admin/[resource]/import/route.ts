import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/adminGuard';
import { importCsv } from '@/lib/imports';
// POST /api/admin/:resource/import?dryRun=1&fetchImages=1   multipart { file: CSV }  (or JSON { csv: "..." })
// Rows with an existing id (or matching brand+name / code / slug / email) are updated, others are created.
export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const { resource } = await params; const sp = req.nextUrl.searchParams;
  let text = '';
  if ((req.headers.get('content-type') || '').includes('application/json')) { const b = await req.json().catch(() => null); text = typeof b?.csv === 'string' ? b.csv : ''; }
  else { const f = (await req.formData().catch(() => null))?.get('file'); if (f instanceof File) { if (f.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'File is larger than 4 MB' }, { status: 413 }); text = await f.text(); } }
  if (!text.trim()) return NextResponse.json({ error: 'Choose a CSV file to import' }, { status: 400 });
  const r = await importCsv(resource, text, { dryRun: sp.get('dryRun') === '1', fetchImages: sp.get('fetchImages') === '1', origin: req.nextUrl.origin, admin: g });
  return NextResponse.json(r.body, { status: r.status });
}
