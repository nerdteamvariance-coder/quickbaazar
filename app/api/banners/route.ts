import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
// GET /api/banners?placement=hero|promo  (active only, sorted)
export async function GET(req: NextRequest) {
  const pl = req.nextUrl.searchParams.get('placement');
  return NextResponse.json(db().banners.filter(b => b.active && (!pl || b.placement === pl)).sort((a, b) => a.sort - b.sort));
}
