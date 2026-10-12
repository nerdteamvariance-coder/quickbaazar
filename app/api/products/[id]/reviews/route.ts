import { NextResponse } from 'next/server';
import { getReviews, addReview } from '@/lib/db';
// GET /api/products/:id/reviews   POST { name, rating, text }
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; return NextResponse.json(getReviews(Number(id))); }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const b = await req.json();
  if (!b.text || !(b.rating >= 1 && b.rating <= 5)) return NextResponse.json({ error: 'Rating (1-5) and text required' }, { status: 400 });
  return NextResponse.json(addReview(Number(id), { name: b.name || 'Shopper', rating: b.rating, text: b.text }), { status: 201 });
}
