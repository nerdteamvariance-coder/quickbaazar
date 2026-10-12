import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
// GET -> public store settings (announcement bar, shipping rules, contact)
export async function GET() { const { storeName, freeShipAbove, shippingFee, supportEmail, supportPhone, announcements } = db().settings; return NextResponse.json({ storeName, freeShipAbove, shippingFee, supportEmail, supportPhone, announcements: announcements.split('\n').filter(Boolean) }); }
