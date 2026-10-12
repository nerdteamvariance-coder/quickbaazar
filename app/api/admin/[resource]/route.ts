import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/adminGuard';
import { listItems, createItem } from '@/lib/adminCrud';
// GET /api/admin/:resource?q=&page=&limit=&status=      POST /api/admin/:resource
// resource = products | banners | blogs | coupons | orders | customers | enquiries | subscribers | logs
export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const { resource } = await params; const r = listItems(resource, req.nextUrl.searchParams); return NextResponse.json(r.body, { status: r.status });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const g = await guard(); if (g instanceof NextResponse) return g;
  const { resource } = await params; const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const r = createItem(resource, body, g); return NextResponse.json(r.body, { status: r.status });
}
