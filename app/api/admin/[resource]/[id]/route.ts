import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/adminGuard';
import { getItem, updateItem, deleteItem } from '@/lib/adminCrud';
type P = { params: Promise<{ resource: string; id: string }> };
export async function GET(_: NextRequest, { params }: P) { const g = await guard(); if (g instanceof NextResponse) return g; const { resource, id } = await params; const r = getItem(resource, id); return NextResponse.json(r.body, { status: r.status }); }
export async function PUT(req: NextRequest, { params }: P) {
  const g = await guard(); if (g instanceof NextResponse) return g; const { resource, id } = await params; const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const r = updateItem(resource, id, body, g); return NextResponse.json(r.body, { status: r.status });
}
export const PATCH = PUT;
export async function DELETE(_: NextRequest, { params }: P) { const g = await guard(); if (g instanceof NextResponse) return g; const { resource, id } = await params; const r = deleteItem(resource, id, g); return NextResponse.json(r.body, { status: r.status }); }
