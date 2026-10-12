import { NextResponse } from 'next/server';
import { allBrands } from '@/lib/db';
export async function GET() { return NextResponse.json(allBrands()); }
