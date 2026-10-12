import { NextResponse } from 'next/server';
import { getSession, placeOrder, ordersFor } from '@/lib/db';
// GET -> my orders   POST { address:{name,phone,line1,pin,city}, payment:'upi'|'card'|'netbanking'|'cod' }
export async function GET() { const { sid, s } = await getSession(); return NextResponse.json(ordersFor(sid, s.user?.phone)); }
export async function POST(req: Request) {
  const { sid, s } = await getSession(); const b = await req.json();
  const a = b.address || {};
  if (!a.name || !a.phone || !a.line1 || !/^\d{6}$/.test(a.pin || '')) return NextResponse.json({ error: 'Name, phone, address and a 6-digit pincode are required' }, { status: 422 });
  try { return NextResponse.json(placeOrder(sid, s, { address: a, payment: b.payment || 'upi' }), { status: 201 }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
