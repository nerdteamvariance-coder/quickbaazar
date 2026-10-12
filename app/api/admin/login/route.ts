import { NextResponse } from 'next/server';
import { checkCredentials, setAdminCookie, adminUser } from '@/lib/adminAuth';
import { logAction } from '@/lib/store';
// POST { email, password } -> sets the admin session cookie
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.email || !b.password) return NextResponse.json({ error: 'Email and password are required' }, { status: 422 });
  if (!checkCredentials(b.email, b.password)) return NextResponse.json({ error: 'Wrong email or password' }, { status: 401 });
  await setAdminCookie(); logAction(adminUser(), 'logged in', 'auth', '-');
  return NextResponse.json({ ok: true });
}
