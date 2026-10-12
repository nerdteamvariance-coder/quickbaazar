import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const b = db().blogs.find(x => x.slug === slug && x.published);
  return b ? NextResponse.json(b) : NextResponse.json({ error: 'Post not found' }, { status: 404 });
}
