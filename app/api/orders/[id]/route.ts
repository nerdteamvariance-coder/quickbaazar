import { NextResponse } from 'next/server';
import { findOrder } from '@/lib/db';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const o = findOrder(id);
  return o ? NextResponse.json(o) : NextResponse.json({ error: 'Order not found' }, { status: 404 });
}
