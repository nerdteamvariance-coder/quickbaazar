// Persistent JSON store shared by the storefront and the admin panel.
// Data lives in ./data/db.json (override with DATA_FILE). Swap this module for Postgres/Mongo when you scale —
// everything else talks to it through db() and save().
import fs from 'fs';
import path from 'path';
import { PRODUCTS, COUPONS, HERO, ORDER_STATUSES, type Product } from './data';

export type Banner = { id: number; title: string; subtitle: string; chip: string; image: string; href: string; placement: 'hero' | 'promo'; active: boolean; sort: number };
export type Blog = { id: number; slug: string; title: string; excerpt: string; content: string; image: string; author: string; tags: string; published: boolean; date: string };
export type Coupon = { id: number; code: string; title: string; note: string; type: 'percent' | 'flat' | 'freeship'; value: number; max: number; minOrder: number; active: boolean; expiresAt: string };
export type OrderItem = { productId: number; size: string; qty: number; price: number; brand: string; name: string; image: string };
export type Order = { id: string; sid: string; phone: string; date: string; status: string; items: OrderItem[]; total: number; payment: string; address: any; couponCode?: string; courier?: string; trackingId?: string; note?: string };
export type Checkout = { id: number; token: string; sid: string; name: string; phone: string; email: string; items: OrderItem[]; total: number; stage: 'cart' | 'checkout'; status: 'open' | 'reminded' | 'recovered' | 'converted'; createdAt: string; updatedAt: string; remindedAt: string };
export type Review = { id: number; productId: number; name: string; rating: number; text: string; date: string; helpful: number; status: 'approved' | 'pending' };
export type WishlistEntry = { id: number; sid: string; phone: string; ids: number[]; updatedAt: string };
export type Customer = { id: number; phone: string; name: string; joined: string };
export type Enquiry = { id: number; name: string; email: string; orderId: string; topic: string; message: string; status: 'new' | 'resolved'; date: string };
export type Subscriber = { id: number; email: string; date: string };
export type Log = { id: number; date: string; user: string; action: string; resource: string; itemId: string };
export type Settings = { storeName: string; freeShipAbove: number; shippingFee: number; supportEmail: string; supportPhone: string; announcements: string; gtmId: string; ga4Id: string; metaPixelId: string; abandonAfterMin: number; lowStockAt: number; recoveryMessage: string };
export type DB = { products: Product[]; banners: Banner[]; blogs: Blog[]; coupons: Coupon[]; orders: Order[]; customers: Customer[]; checkouts: Checkout[]; reviews: Review[]; wishlists: WishlistEntry[]; enquiries: Enquiry[]; subscribers: Subscriber[]; logs: Log[]; settings: Settings };

export { ORDER_STATUSES };
const FILE = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'db.json');
const now = () => new Date().toISOString();

function seed(): DB {
  const day = (n: number) => new Date(Date.now() - n * 864e5).toISOString();
  return {
    products: PRODUCTS.map(p => ({ ...p, active: true, description: `${p.name} from ${p.brand}. Designed for everyday wear with a comfortable fit and durable build.` })),
    banners: HERO.map((h, i) => ({ id: i + 1, title: h.h, subtitle: h.t, chip: h.chip, image: h.image, href: h.href, placement: 'hero' as const, active: true, sort: i + 1 })),
    blogs: [
      { id: 1, slug: 'how-to-pick-the-right-sneaker-size', title: 'How to pick the right sneaker size online', excerpt: 'Three measurements and one trick that stop you ordering twice.', image: 'sneaker1', author: 'QuickBaazar Editorial', tags: 'guide, footwear', published: true, date: day(6),
        content: 'Measure your foot in the evening, when it is largest.\n\nStand on a sheet of paper, mark the heel and longest toe, and measure the gap in centimetres.\n\nCompare with the size guide on the product page, and go one size up if you are between sizes or wear thick socks.' },
      { id: 2, slug: 'festive-wardrobe-capsule', title: 'A 7-piece festive capsule wardrobe', excerpt: 'Mix and match seven pieces into a dozen outfits.', image: 'w3', author: 'QuickBaazar Editorial', tags: 'style, women', published: true, date: day(2),
        content: 'Start with two kurta sets in solid colours.\n\nAdd one statement dress, one co-ord set and a pair of white sneakers.\n\nFinish with a structured bag and a lightweight shrug. Every piece works with at least three others.' },
    ],
    coupons: COUPONS.map((c, i) => ({ id: i + 1, code: c.code, title: c.title, note: c.note, type: (c.code === 'FREESHIP' ? 'freeship' : c.code === 'FIRST100' ? 'flat' : 'percent') as Coupon['type'], value: c.code === 'FIRST100' ? 100 : c.code === 'FREESHIP' ? 0 : 10, max: c.code === 'QUICK10' ? 300 : c.code === 'HDFC10' ? 1500 : 0, minOrder: c.code === 'QUICK10' ? 999 : c.code === 'FREESHIP' ? 499 : 0, active: true, expiresAt: '' })),
    orders: [
      { id: 'QB-10482', sid: 'seed', phone: '9876543210', date: day(14), status: 'Delivered', items: [{ productId: 14, size: 'M', qty: 1, price: 919, brand: 'Allen Solly', name: 'Slim Fit Casual Shirt', image: 'cloth' }], total: 919, payment: 'upi', address: { name: 'Aisha K.', city: 'Mumbai', pin: '400001', line1: 'Bandra West' } },
      { id: 'QB-10391', sid: 'seed', phone: '9811122233', date: day(3), status: 'Shipped', items: [{ productId: 5, size: 'L', qty: 2, price: 449, brand: 'Roadster', name: 'Pure Cotton Boxy Fit T-shirt', image: 'tee' }], total: 898, payment: 'cod', address: { name: 'Rohan M.', city: 'Pune', pin: '411001', line1: 'Kothrud' } },
      { id: 'QB-10533', sid: 'seed', phone: '9900011122', date: day(0), status: 'Placed', items: [{ productId: 2, size: '8', qty: 1, price: 2279, brand: 'Puma', name: 'Unisex Rickie Classic Sneakers', image: 'sneaker2' }], total: 2279, payment: 'card', address: { name: 'Sneha R.', city: 'Delhi', pin: '110001', line1: 'Saket' } },
    ],
    customers: [{ id: 1, phone: '9876543210', name: 'Aisha K.', joined: day(40) }, { id: 2, phone: '9811122233', name: 'Rohan M.', joined: day(22) }, { id: 3, phone: '9900011122', name: 'Sneha R.', joined: day(9) }],
    checkouts: [
      { id: 1, token: 'demo-aisha-cart', sid: 'seed', name: 'Aisha K.', phone: '9876543210', email: 'aisha@example.com', items: [{ productId: 13, size: '7', qty: 1, price: 3899, brand: 'Skechers', name: 'Arch Fit Walking Sneakers', image: 'sneaker5' }], total: 3899, stage: 'checkout', status: 'open', createdAt: day(2), updatedAt: day(2), remindedAt: '' },
      { id: 2, token: 'demo-rohan-cart', sid: 'seed', name: '', phone: '9811122233', email: '', items: [{ productId: 7, size: 'M', qty: 2, price: 1199, brand: 'Libas', name: 'Printed Straight Kurta Set', image: 'w1' }], total: 2398, stage: 'cart', status: 'reminded', createdAt: day(4), updatedAt: day(3), remindedAt: day(3) },
    ],
    reviews: [],
    wishlists: [{ id: 1, sid: 'seed', phone: '9900011122', ids: [2, 9, 13], updatedAt: day(1) }, { id: 2, sid: 'seed2', phone: '9811122233', ids: [2, 7], updatedAt: day(2) }],
    enquiries: [{ id: 1, name: 'Rohan M.', email: 'rohan@example.com', orderId: 'QB-10391', topic: 'Order status', message: 'Can you confirm the delivery date for my order?', status: 'new', date: day(1) }],
    subscribers: [{ id: 1, email: 'aisha@example.com', date: day(12) }, { id: 2, email: 'sneha@example.com', date: day(5) }],
    logs: [],
    settings: { storeName: 'QuickBaazar', freeShipAbove: 799, shippingFee: 79, supportEmail: 'help@quickbaazar.example', supportPhone: '1800-000-QUICK', announcements: 'Free delivery over ₹799\n14-day easy returns\nCash on delivery available\n10% off with HDFC cards', gtmId: '', ga4Id: '', metaPixelId: '', abandonAfterMin: 30, lowStockAt: 10, recoveryMessage: 'Hi {name}, you left {items} in your QuickBaazar bag. Complete your order here: {link}' },
  };
}

const g = globalThis as any;
export function db(): DB {
  if (g.__qb_db) return g.__qb_db;
  let d: DB;
  try { const base = seed(), saved = JSON.parse(fs.readFileSync(FILE, 'utf8')); d = { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } }; }
  catch { d = seed(); try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); } catch {} }
  g.__qb_db = d; return d;
}
export function save() { try { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(g.__qb_db, null, 2)); } catch (e) { console.error('save failed', e); } }
export function nextId(list: { id: number }[]) { return list.reduce((m, x) => Math.max(m, x.id), 0) + 1; }
export function logAction(user: string, action: string, resource: string, itemId: string | number) {
  const d = db(); d.logs.unshift({ id: nextId(d.logs), date: now(), user, action, resource, itemId: String(itemId) }); d.logs = d.logs.slice(0, 500); save();
}
export const activeProducts = () => db().products.filter(p => p.active !== false);
