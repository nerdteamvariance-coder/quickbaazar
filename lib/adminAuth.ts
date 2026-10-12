import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

// Set these in .env.local for real use. The defaults are for local development only.
const USER = process.env.ADMIN_USER || 'admin@quickbaazar.com';
const PASS = process.env.ADMIN_PASSWORD || 'admin123';
const SECRET = process.env.ADMIN_SECRET || 'dev-only-secret-change-me';
const COOKIE = 'qb_admin';
const TTL = 60 * 60 * 12; // 12 hours

const sign = (v: string) => createHmac('sha256', SECRET).update(v).digest('base64url');

export function checkCredentials(user: string, pass: string) {
  const ok = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
  const u = user.trim().toLowerCase();
  const alias = !process.env.ADMIN_USER && u === 'admin'; // dev convenience: "admin" works while default credentials are in use
  return (alias || ok(u, USER.toLowerCase())) && ok(pass, PASS);
}
export const adminUser = () => USER;
export function makeToken() { const exp = Math.floor(Date.now() / 1000) + TTL; const p = `${USER}|${exp}`; return `${Buffer.from(p).toString('base64url')}.${sign(p)}`; }
export async function setAdminCookie() { (await cookies()).set(COOKIE, makeToken(), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: TTL }); }
export async function clearAdminCookie() { (await cookies()).delete(COOKIE); }

/** Returns the admin's email when the cookie is valid, otherwise null. */
export async function currentAdmin(): Promise<string | null> {
  const t = (await cookies()).get(COOKIE)?.value; if (!t) return null;
  const [b, sig] = t.split('.'); if (!b || !sig) return null;
  const p = Buffer.from(b, 'base64url').toString(); const [user, exp] = p.split('|');
  if (sign(p) !== sig || +exp < Date.now() / 1000) return null;
  return user;
}
