import { NextRequest, NextResponse } from 'next/server';
import { trackOrder } from '@/lib/db';
// GET /api/track?orderId=QB-10482  (production: also require the phone number)
export async function GET(req: NextRequest) { const id = req.nextUrl.searchParams.get('orderId'); return id ? NextResponse.json(trackOrder(id)) : NextResponse.json({ error: 'orderId required' }, { status: 400 }); }
