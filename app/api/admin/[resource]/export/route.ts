import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/adminGuard';
import { exportCsv, templateCsv } from '@/lib/imports';
import { logAction } from '@/lib/store';
// GET /api/admin/:resource/export[?ids=1,2,3][&template=1]  -> CSV download (image columns hold full URLs)
export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const { resource } = await params; const sp = req.nextUrl.searchParams;
  const headers = (name: string) => ({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` });
  if (sp.get('template')) { const t = templateCsv(resource); return t ? new Response(t, { headers: headers(`${resource}-import-template.csv`) }) : NextResponse.json({ error: 'Unknown resource' }, { status: 404 }); }
  const ids = sp.get('ids')?.split(',').filter(Boolean);
  const out = exportCsv(resource, req.nextUrl.origin, ids); if (!out) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
  logAction(g, 'exported', resource, ids?.length ? `${ids.length} selected` : 'all');
  return new Response(out.csv, { headers: headers(out.filename) });
}
