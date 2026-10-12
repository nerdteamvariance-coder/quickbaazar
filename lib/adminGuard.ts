import { NextResponse } from 'next/server';
import { currentAdmin } from './adminAuth';
/** Use at the top of every admin route: const g = await guard(); if (g instanceof NextResponse) return g; */
export async function guard(): Promise<string | NextResponse> {
  const u = await currentAdmin();
  return u || NextResponse.json({ error: 'Admin login required' }, { status: 401 });
}
