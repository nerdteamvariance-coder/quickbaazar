import { NextResponse } from 'next/server';
import { pincode } from '@/lib/db';
export async function GET(_: Request, { params }: { params: Promise<{ pin: string }> }) { const { pin } = await params; return NextResponse.json(pincode(pin)); }
