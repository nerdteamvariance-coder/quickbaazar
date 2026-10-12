import { NextResponse } from 'next/server';
import { guard } from '@/lib/adminGuard';
import { db, save, logAction } from '@/lib/store';
// GET -> settings
// PUT { storeName, freeShipAbove, shippingFee, supportEmail, supportPhone, announcements, gtmId, ga4Id, metaPixelId, abandonAfterMin, lowStockAt, recoveryMessage }
export async function GET() { const g = await guard(); if (typeof g !== 'string') return g; return NextResponse.json(db().settings); }
export async function PUT(req: Request) {
  const g = await guard(); if (typeof g !== 'string') return g;
  const b = await req.json().catch(() => null); if (!b || typeof b !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const e: Record<string, string> = {}; const s = db().settings; const str = (k: keyof typeof s) => String(b[k] ?? s[k] ?? '').trim();
  const n = (k: string, min = 0) => { const v = Number(b[k]); if (Number.isNaN(v) || v < min) e[k] = `Enter a number, ${min} or more`; return v; };
  const next = { ...s, storeName: str('storeName'), freeShipAbove: n('freeShipAbove'), shippingFee: n('shippingFee'), supportEmail: str('supportEmail'), supportPhone: str('supportPhone'), announcements: String(b.announcements ?? s.announcements),
    gtmId: str('gtmId').toUpperCase(), ga4Id: str('ga4Id').toUpperCase(), metaPixelId: str('metaPixelId'), abandonAfterMin: n('abandonAfterMin', 1), lowStockAt: n('lowStockAt'), recoveryMessage: String(b.recoveryMessage ?? s.recoveryMessage) };
  if (!next.storeName) e.storeName = 'Store name is required';
  if (next.supportEmail && !/.+@.+\..+/.test(next.supportEmail)) e.supportEmail = 'Enter a valid email';
  if (next.gtmId && !/^GTM-[A-Z0-9]{4,12}$/.test(next.gtmId)) e.gtmId = 'Looks like GTM-XXXXXXX';
  if (next.ga4Id && !/^G-[A-Z0-9]{4,14}$/.test(next.ga4Id)) e.ga4Id = 'Looks like G-XXXXXXXXXX';
  if (next.metaPixelId && !/^\d{8,20}$/.test(next.metaPixelId)) e.metaPixelId = 'Pixel IDs are 8–20 digits';
  if (Object.keys(e).length) return NextResponse.json({ error: 'Please fix the highlighted fields', fields: e }, { status: 422 });
  Object.assign(s, next); save(); logAction(g, 'updated', 'settings', '-'); return NextResponse.json(s);
}
