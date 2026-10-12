// Storefront data layer. Reads/writes the persistent store in lib/store.ts, which the admin panel also edits.
import { cookies } from 'next/headers';
import type { Product } from './data';
import { db, save, nextId, activeProducts, type Order } from './store';

export const disc = (p: Product) => Math.round((1 - p.price / p.mrp) * 100);
export const getSettings = () => db().settings;

type CartLine = { productId: number; size: string; qty: number };
type Session = { cart: CartLine[]; wish: number[]; coupon: string | null; user: { phone: string; name: string } | null };

const g = globalThis as any;
const sessions: Map<string, Session> = (g.__qb_sessions ||= new Map());
const otps: Map<string, string> = (g.__qb_otps ||= new Map());

export async function getSession() {
  const jar = await cookies();
  let sid = jar.get('qb_sid')?.value;
  if (!sid || !sessions.has(sid)) {
    sid = sid || crypto.randomUUID();
    sessions.set(sid, { cart: [], wish: [], coupon: null, user: null });
    try { jar.set('qb_sid', sid, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 }); } catch {}
  }
  return { sid, s: sessions.get(sid)! };
}

/* ---------- catalogue ---------- */
export type Query = { category?: string; q?: string; sort?: string; minPrice?: number; maxPrice?: number; rating?: number; discount?: number; brand?: string[]; page?: number; limit?: number };
export function listProducts(f: Query) {
  const all = activeProducts();
  let l = all.filter(p => !f.category || f.category === 'all' || p.category === f.category || p.gender === f.category);
  if (f.q) { const q = f.q.toLowerCase(); l = all.filter(p => `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(q)); }
  if (f.minPrice) l = l.filter(p => p.price >= f.minPrice!);
  if (f.maxPrice) l = l.filter(p => p.price <= f.maxPrice!);
  if (f.rating) l = l.filter(p => p.rating >= f.rating!);
  if (f.discount) l = l.filter(p => disc(p) >= f.discount!);
  if (f.brand?.length) l = l.filter(p => f.brand!.includes(p.brand));
  const brands = [...new Set(l.map(p => p.brand))];
  const sorts: Record<string, (a: Product, b: Product) => number> = {
    lo: (a, b) => a.price - b.price, hi: (a, b) => b.price - a.price, off: (a, b) => disc(b) - disc(a), rate: (a, b) => b.rating - a.rating,
  };
  if (f.sort && sorts[f.sort]) l = [...l].sort(sorts[f.sort]);
  const limit = f.limit || 24, page = f.page || 1;
  return { total: l.length, page, limit, brands, items: l.slice((page - 1) * limit, page * limit) };
}
export const getProduct = (id: number) => activeProducts().find(p => p.id === id);
export const relatedProducts = (id: number, n = 6) => { const p = getProduct(id); return activeProducts().filter(x => x.id !== id && p && x.category === p.category).slice(0, n); };
export const allBrands = () => [...new Set(activeProducts().map(p => p.brand))].sort();
export const liveCoupons = () => db().coupons.filter(c => c.active && (!c.expiresAt || new Date(c.expiresAt).getTime() > Date.now()));

const DEFAULT_REVIEWS = [
  { name: 'Aarav S.', rating: 5, text: 'Exactly as shown. Sizing is true — I went with my usual.', date: '2 weeks ago', helpful: 24 },
  { name: 'Meera K.', rating: 5, text: 'Quality is far better than the price suggests. Delivery took 3 days.', date: '1 month ago', helpful: 17 },
  { name: 'Imran H.', rating: 4, text: 'Returned one size and the exchange was quick. Happy with the pair.', date: '1 month ago', helpful: 9 },
];
export function getReviews(productId: number) {
  const d = db();
  if (!d.reviews.some(r => r.productId === productId)) { for (const r of DEFAULT_REVIEWS) d.reviews.push({ id: nextId(d.reviews), productId, status: 'approved', ...r }); save(); }
  return d.reviews.filter(r => r.productId === productId && r.status === 'approved').sort((a, b) => b.id - a.id);
}
export function addReview(productId: number, r: { name: string; rating: number; text: string }) {
  getReviews(productId); // make sure the default reviews exist before the first new one is added
  const d = db(); const rv = { id: nextId(d.reviews), productId, name: r.name, rating: r.rating, text: r.text, date: 'Just now', helpful: 0, status: 'pending' as const };
  d.reviews.push(rv); save(); return rv;
}

/* ---------- coupons & cart ---------- */
export function couponOff(code: string | null, subtotal: number) {
  if (!code) return 0;
  const c = liveCoupons().find(x => x.code === code);
  if (!c || subtotal < c.minOrder) return 0;
  if (c.type === 'flat') return Math.min(c.value, subtotal);
  if (c.type === 'percent') { const off = Math.round((subtotal * c.value) / 100); return c.max ? Math.min(c.max, off) : off; }
  return 0;
}
export function validateCoupon(code: string, subtotal: number) {
  const all = db().coupons.find(x => x.code === code.trim().toUpperCase());
  if (!all || !all.active) return { ok: false, message: 'That code isn’t valid' };
  if (all.expiresAt && new Date(all.expiresAt).getTime() < Date.now()) return { ok: false, message: 'That code has expired' };
  if (subtotal < all.minOrder) return { ok: false, message: `${all.code} needs ₹${all.minOrder.toLocaleString('en-IN')} or more in your bag` };
  return { ok: true, code: all.code, message: `${all.code} applied` };
}
export function priceCart(s: Session) {
  const st = getSettings();
  const items = s.cart.map((l, i) => ({ id: i, ...l, product: getProduct(l.productId)! })).filter(x => x.product);
  const subtotal = items.reduce((a, x) => a + x.product.price * x.qty, 0);
  const mrp = items.reduce((a, x) => a + x.product.mrp * x.qty, 0);
  const off = couponOff(s.coupon, subtotal);
  const freeShipCoupon = !!s.coupon && liveCoupons().some(c => c.code === s.coupon && c.type === 'freeship');
  const shipping = subtotal === 0 || subtotal > st.freeShipAbove || freeShipCoupon ? 0 : st.shippingFee;
  return { items, count: items.reduce((a, x) => a + x.qty, 0), mrp, subtotal, discount: mrp - subtotal, coupon: s.coupon, couponOff: off, shipping, total: subtotal - off + shipping, freeShipLeft: Math.max(0, st.freeShipAbove - subtotal) };
}

/* ---------- orders ---------- */
export function placeOrder(sid: string, s: Session, body: { address: any; payment: string }) {
  const cart = priceCart(s);
  if (!cart.items.length) throw new Error('Cart is empty');
  const d = db();
  const o: Order = {
    id: 'QB-' + (10500 + Math.floor(Math.random() * 9000)), sid, phone: s.user?.phone || body.address?.phone || '', date: new Date().toISOString(), status: 'Placed',
    items: cart.items.map(x => ({ productId: x.productId, size: x.size, qty: x.qty, price: x.product.price, brand: x.product.brand, name: x.product.name, image: x.product.image })),
    total: cart.total, payment: body.payment, address: body.address, couponCode: s.coupon || undefined,
  };
  d.orders.unshift(o);
  // decrement stock
  for (const it of o.items) { const p = d.products.find(x => x.id === it.productId); if (p) p.stock = Math.max(0, p.stock - it.qty); }
  for (const c of d.checkouts.filter(x => x.sid === sid && (x.status === 'open' || x.status === 'reminded'))) {
    c.status = c.status === 'reminded' ? 'recovered' : 'converted'; c.updatedAt = o.date; c.total = o.total;
    c.name = c.name || body.address?.name || ''; c.phone = c.phone || body.address?.phone || '';
  }
  save(); s.cart = []; s.coupon = null; return o;
}
/* ---------- abandoned carts / checkouts ---------- */
const snapshot = (cart: ReturnType<typeof priceCart>) => cart.items.map(x => ({ productId: x.productId, size: x.size, qty: x.qty, price: x.product.price, brand: x.product.brand, name: x.product.name, image: x.product.image }));
/** Call after any cart change. Keeps one open checkout record per session so the admin can follow up on abandoned carts. */
export function touchCheckout(sid: string, s: Session, patch?: { name?: string; phone?: string; email?: string; stage?: 'cart' | 'checkout' }) {
  const d = db(); const cart = priceCart(s);
  let c = d.checkouts.find(x => x.sid === sid && (x.status === 'open' || x.status === 'reminded'));
  if (!cart.items.length) { if (c) { d.checkouts.splice(d.checkouts.indexOf(c), 1); save(); } return null; }
  const t = new Date().toISOString();
  if (!c) { c = { id: nextId(d.checkouts), token: crypto.randomUUID().replace(/-/g, ''), sid, name: '', phone: s.user?.phone || '', email: '', items: [], total: 0, stage: 'cart', status: 'open', createdAt: t, updatedAt: t, remindedAt: '' }; d.checkouts.unshift(c); }
  c.items = snapshot(cart); c.total = cart.total; c.updatedAt = t;
  if (s.user && !c.phone) { c.phone = s.user.phone; c.name = c.name || s.user.name; }
  if (patch) { if (patch.name) c.name = patch.name; if (patch.phone) c.phone = patch.phone; if (patch.email) c.email = patch.email; if (patch.stage === 'checkout') c.stage = 'checkout'; }
  save(); return c;
}
export function restoreCheckout(s: Session, token: string) {
  const c = db().checkouts.find(x => x.token === token); if (!c) return null;
  s.cart = c.items.filter(i => getProduct(i.productId)).map(i => ({ productId: i.productId, size: i.size, qty: i.qty })); s.coupon = null; return c;
}
export function syncWishlist(sid: string, s: Session) {
  const d = db(); let w = d.wishlists.find(x => x.sid === sid);
  if (!s.wish.length) { if (w) { d.wishlists.splice(d.wishlists.indexOf(w), 1); save(); } return; }
  if (!w) { w = { id: nextId(d.wishlists), sid, phone: s.user?.phone || '', ids: [], updatedAt: '' }; d.wishlists.push(w); }
  w.ids = [...s.wish]; w.updatedAt = new Date().toISOString(); if (s.user) w.phone = s.user.phone; save();
}
export function linkSession(sid: string, s: Session) {
  if (!s.user) return; const d = db();
  d.checkouts.filter(c => c.sid === sid && !c.phone).forEach(c => { c.phone = s.user!.phone; c.name = c.name || s.user!.name; });
  d.wishlists.filter(w => w.sid === sid).forEach(w => (w.phone = s.user!.phone)); save();
}

export const ordersFor = (sid: string, phone?: string) => db().orders.filter(o => o.sid === sid || (phone && o.phone === phone));
export const findOrder = (id: string) => db().orders.find(x => x.id === id.toUpperCase()) || null;
export function trackOrder(id: string) {
  const stages = ['Order placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
  const o = findOrder(id); const statuses = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
  const stage = o ? Math.max(0, statuses.indexOf(o.status)) : 1 + (id.length + id.charCodeAt(id.length - 1)) % 4;
  return { orderId: id.toUpperCase(), status: o?.status, courier: o?.courier || null, trackingId: o?.trackingId || null, stages: stages.map((label, i) => ({ label, done: i <= stage })), eta: new Date(Date.now() + 4 * 864e5).toISOString() };
}

/* ---------- auth (demo OTP: any 4 digits verify) ---------- */
export function sendOtp(phone: string) { otps.set(phone, '1234'); return { sent: true, demoHint: 'Any 4 digits will verify in this demo' }; }
export function verifyOtp(s: Session, phone: string, code: string, name?: string) {
  if (!/^\d{4}$/.test(code)) return false;
  const d = db(); let c = d.customers.find(x => x.phone === phone);
  if (!c) { c = { id: nextId(d.customers), phone, name: name || 'Shopper', joined: new Date().toISOString() }; d.customers.push(c); save(); }
  s.user = { phone, name: c.name }; return true;
}

export function pincode(pin: string) {
  if (!/^\d{6}$/.test(pin)) return { serviceable: false, message: 'Enter a valid 6-digit pincode' };
  return { serviceable: true, cod: true, freeDelivery: true, eta: new Date(Date.now() + 4 * 864e5).toISOString(), city: 'Your city' };
}
