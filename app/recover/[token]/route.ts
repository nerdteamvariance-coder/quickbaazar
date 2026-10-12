import { NextRequest, NextResponse } from 'next/server';
import { getSession, restoreCheckout } from '@/lib/db';
// GET /recover/:token -> puts the abandoned cart back in this browser's bag and opens checkout
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const { s } = await getSession();
  const c = restoreCheckout(s, token);
  return NextResponse.redirect(new URL(c && s.cart.length ? '/checkout' : '/bag', req.url));
}
