import { NextResponse } from 'next/server';
import { getSession, touchCheckout } from '@/lib/db';
// POST { name?, phone?, email? } -> remembers contact details while the shopper is on the checkout page,
// so a left-behind cart shows up under "Abandoned checkouts" with a way to reach them.
export async function POST(req: Request) {
  const { sid, s } = await getSession(); const b = await req.json().catch(() => ({}));
  const phone = String(b.phone || '').replace(/\D/g, '').slice(-10), email = String(b.email || '').trim().toLowerCase(), name = String(b.name || '').trim().slice(0, 80);
  if (!/^\d{10}$/.test(phone) && !/.+@.+\..+/.test(email)) return NextResponse.json({ error: 'Enter a 10-digit phone number or a valid email' }, { status: 422 });
  const c = touchCheckout(sid, s, { name, phone: /^\d{10}$/.test(phone) ? phone : undefined, email: /.+@.+\..+/.test(email) ? email : undefined, stage: 'checkout' });
  if (!c) return NextResponse.json({ error: 'Your bag is empty' }, { status: 400 });
  return NextResponse.json({ saved: true });
}
