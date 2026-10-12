import { NextRequest, NextResponse } from 'next/server';
import { listProducts } from '@/lib/db';
// GET /api/products?category=&q=&sort=rec|lo|hi|off|rate&minPrice=&maxPrice=&rating=&discount=&brand=Puma&page=&limit=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams, n = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  return NextResponse.json(listProducts({ category: sp.get('category') || undefined, q: sp.get('q') || undefined, sort: sp.get('sort') || undefined, minPrice: n('minPrice'), maxPrice: n('maxPrice'), rating: n('rating'), discount: n('discount'), brand: sp.getAll('brand'), page: n('page'), limit: n('limit') }));
}
