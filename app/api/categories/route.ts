import { NextResponse } from 'next/server';
import { MENU } from '@/lib/data';
// GET /api/categories -> mega-menu tree
export async function GET() { return NextResponse.json(MENU); }
