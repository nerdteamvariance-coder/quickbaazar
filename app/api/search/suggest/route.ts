import { NextRequest, NextResponse } from 'next/server';
import { listProducts } from '@/lib/db';
// GET /api/search/suggest?q=sne -> { trending, products }
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  return NextResponse.json({ trending: ['sneakers', 'kurta set', 'white shirt', 'running shoes', 'dress', 'co-ord set'], products: q ? listProducts({ q, limit: 5 }).items : [] });
}
