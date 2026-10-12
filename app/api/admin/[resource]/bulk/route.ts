import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/adminGuard';
import { bulk } from '@/lib/adminCrud';
// POST { action:'delete'|'set'|'priceAdjust', ids:[1,2], field?, value?, percent? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const { resource } = await params; const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const r = bulk(resource, body, g); return NextResponse.json(r.body, { status: r.status });
}
