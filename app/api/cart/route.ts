import { NextResponse } from 'next/server';
import { getSession, priceCart, touchCheckout } from '@/lib/db';
// GET /api/cart                              -> priced cart
// POST /api/cart   { productId, size, qty? } -> add line
// PATCH /api/cart  { index, qty }            -> change qty (0 removes)
// DELETE /api/cart { index } | {}            -> remove line | clear
export async function GET() { const { s } = await getSession(); return NextResponse.json(priceCart(s)); }
export async function POST(req: Request) {
  const { sid, s } = await getSession(); const b = await req.json().catch(() => ({}));
  if (!b.productId || !b.size) return NextResponse.json({ error: 'productId and size required' }, { status: 400 });
  const l = s.cart.find(x => x.productId === b.productId && x.size === String(b.size));
  if (l) l.qty += b.qty || 1; else s.cart.push({ productId: b.productId, size: String(b.size), qty: b.qty || 1 });
  touchCheckout(sid, s); return NextResponse.json(priceCart(s));
}
export async function PATCH(req: Request) {
  const { sid, s } = await getSession(); const { index, qty } = await req.json().catch(() => ({}));
  if (s.cart[index]) { if (qty < 1) s.cart.splice(index, 1); else s.cart[index].qty = qty; }
  touchCheckout(sid, s); return NextResponse.json(priceCart(s));
}
export async function DELETE(req: Request) {
  const { sid, s } = await getSession(); const b = await req.json().catch(() => ({}));
  if (typeof b.index === 'number') s.cart.splice(b.index, 1); else s.cart = [];
  touchCheckout(sid, s); return NextResponse.json(priceCart(s));
}
