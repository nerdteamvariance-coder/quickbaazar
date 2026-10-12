import { NextResponse } from 'next/server';
import { getSession, verifyOtp, linkSession } from '@/lib/db';
// POST { phone, code, name? } -> logs the session in
export async function POST(req: Request) {
  const { sid, s } = await getSession(); const b = await req.json().catch(() => ({}));
  if (!verifyOtp(s, b.phone, b.code, b.name)) return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  linkSession(sid, s); return NextResponse.json({ user: s.user });
}
