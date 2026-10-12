import { NextResponse } from 'next/server';
import { getSession, priceCart, validateCoupon, touchCheckout } from '@/lib/db';
// POST { code } apply   DELETE remove
export async function POST(req: Request) {
  const { sid, s } = await getSession(); const { code } = await req.json().catch(() => ({}));
  const v = validateCoupon(code || '', priceCart(s).subtotal);
  if (!v.ok) return NextResponse.json({ error: v.message }, { status: 422 });
  s.coupon = v.code!; touchCheckout(sid, s); return NextResponse.json(priceCart(s));
}
export async function DELETE() { const { sid, s } = await getSession(); s.coupon = null; touchCheckout(sid, s); return NextResponse.json(priceCart(s)); }
