import { NextResponse } from 'next/server';
import { db, save, nextId } from '@/lib/store';
// POST { email } -> saved as a subscriber in the admin panel
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!/.+@.+\..+/.test(email || '')) return NextResponse.json({ error: 'Enter a valid email' }, { status: 422 });
  const d = db(); if (!d.subscribers.some(s => s.email === email)) { d.subscribers.unshift({ id: nextId(d.subscribers), email, date: new Date().toISOString() }); save(); }
  return NextResponse.json({ subscribed: true }, { status: 201 });
}
