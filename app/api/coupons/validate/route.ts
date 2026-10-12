import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/db';
// POST { code, subtotal }
export async function POST(req: Request) { const { code, subtotal } = await req.json(); return NextResponse.json(validateCoupon(code || '', subtotal || 0)); }
