import { NextResponse } from 'next/server';
import { db, save, nextId } from '@/lib/store';
// POST { name, email, orderId?, topic, message } -> saved as an enquiry in the admin panel
export async function POST(req: Request) {
  const b = await req.json();
  if (!b.email || !b.message) return NextResponse.json({ error: 'Email and message required' }, { status: 422 });
  const d = db(); const id = nextId(d.enquiries);
  d.enquiries.unshift({ id, name: b.name || '', email: b.email, orderId: b.orderId || '', topic: b.topic || 'Something else', message: b.message, status: 'new', date: new Date().toISOString() }); save();
  return NextResponse.json({ ticketId: 'T-' + String(id).padStart(5, '0') }, { status: 201 });
}
