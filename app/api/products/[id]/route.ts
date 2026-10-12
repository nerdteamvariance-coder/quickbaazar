import { NextResponse } from 'next/server';
import { getProduct, relatedProducts } from '@/lib/db';
// GET /api/products/:id  -> product + related
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const p = getProduct(Number(id));
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: p, related: relatedProducts(p.id) });
}
