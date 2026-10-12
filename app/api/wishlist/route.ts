import { NextResponse } from 'next/server';
import { getSession, syncWishlist } from '@/lib/db';
import { activeProducts } from '@/lib/store';
// GET -> products   POST { productId } add   DELETE { productId } remove
export async function GET() { const { s } = await getSession(); return NextResponse.json({ ids: s.wish, items: activeProducts().filter(p => s.wish.includes(p.id)) }); }
export async function POST(req: Request) { const { sid, s } = await getSession(); const { productId } = await req.json(); if (!s.wish.includes(productId)) s.wish.push(productId); syncWishlist(sid, s); return NextResponse.json({ ids: s.wish }); }
export async function DELETE(req: Request) { const { sid, s } = await getSession(); const { productId } = await req.json(); s.wish = s.wish.filter(x => x !== productId); syncWishlist(sid, s); return NextResponse.json({ ids: s.wish }); }
