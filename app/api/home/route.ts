import { NextResponse } from 'next/server';
import { STORIES } from '@/lib/data';
import { disc } from '@/lib/db';
import { db, activeProducts } from '@/lib/store';
// GET /api/home -> everything the home page needs in one call
export async function GET() {
  const P = activeProducts();
  const hero = db().banners.filter(b => b.active && b.placement === 'hero').sort((a, b) => a.sort - b.sort);
  return NextResponse.json({ hero, stories: STORIES, trending: P.slice(0, 8), flashDeals: [...P].sort((a, b) => disc(b) - disc(a)).slice(0, 8), recommended: P.slice(8) });
}
