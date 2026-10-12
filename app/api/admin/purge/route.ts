import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { guard } from '@/lib/adminGuard';
import { logAction } from '@/lib/store';
// POST -> refresh every cached storefront page
export async function POST() { const g = await guard(); if (typeof g !== 'string') return g; revalidatePath('/', 'layout'); logAction(g, 'purged cache', 'system', '-'); return NextResponse.json({ ok: true }); }
