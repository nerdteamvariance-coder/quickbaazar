import { NextResponse } from 'next/server';
import { liveCoupons } from '@/lib/db';
export async function GET() { return NextResponse.json(liveCoupons().map(({ code, title, note }) => ({ code, title, note }))); }
