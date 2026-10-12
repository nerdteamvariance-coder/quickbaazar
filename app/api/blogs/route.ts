import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
// GET /api/blogs -> published posts, newest first (without full content)
export async function GET() {
  return NextResponse.json(db().blogs.filter(b => b.published).sort((a, b) => +new Date(b.date) - +new Date(a.date)).map(({ content, ...b }) => b));
}
