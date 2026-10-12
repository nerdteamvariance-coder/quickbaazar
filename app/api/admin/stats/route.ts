import { NextResponse } from 'next/server';
import { guard } from '@/lib/adminGuard';
import { dashboardStats, analytics } from '@/lib/stats';
export async function GET() { const g = await guard(); if (typeof g !== 'string') return g; return NextResponse.json({ ...dashboardStats(), analytics: analytics() }); }
