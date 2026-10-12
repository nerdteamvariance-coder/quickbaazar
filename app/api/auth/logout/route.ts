import { NextResponse } from 'next/server';
import { getSession } from '@/lib/db';
export async function POST() { const { s } = await getSession(); s.user = null; return NextResponse.json({ ok: true }); }
