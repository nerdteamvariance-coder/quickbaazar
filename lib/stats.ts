import { db } from './store';

const sameDay = (iso: string, d = new Date()) => new Date(iso).toDateString() === d.toDateString();
export function dashboardStats() {
  const d = db(); const o = d.orders;
  const by = (...s: string[]) => o.filter(x => s.includes(x.status));
  const today = (l: { date: string }[]) => l.filter(x => sameDay(x.date)).length;
  const live = o.filter(x => !['Cancelled', 'Returned'].includes(x.status));
  const series = Array.from({ length: 7 }, (_, i) => { const day = new Date(Date.now() - (6 - i) * 864e5); return { label: day.toLocaleDateString('en-IN', { weekday: 'short' }), revenue: live.filter(x => sameDay(x.date, day)).reduce((a, x) => a + x.total, 0), orders: o.filter(x => sameDay(x.date, day)).length }; });
  return {
    orders: { total: o.length, pending: by('Placed', 'Packed').length, pendingToday: today(by('Placed', 'Packed')), dispatched: by('Shipped', 'Out for delivery').length, delivered: by('Delivered').length, cancelled: by('Cancelled').length, returned: by('Returned').length, cancelledToday: today(by('Cancelled')) },
    revenue: live.reduce((a, x) => a + x.total, 0), revenueToday: live.filter(x => sameDay(x.date)).reduce((a, x) => a + x.total, 0),
    customers: { total: d.customers.length, today: d.customers.filter(c => sameDay(c.joined)).length },
    subscribers: { total: d.subscribers.length, today: today(d.subscribers) },
    enquiries: { total: d.enquiries.length, open: d.enquiries.filter(e => e.status === 'new').length },
    products: { total: d.products.length, active: d.products.filter(p => p.active !== false).length, inactive: d.products.filter(p => p.active === false).length, outOfStock: d.products.filter(p => p.stock <= 0).length, lowStock: d.products.filter(p => p.stock > 0 && p.stock <= 10).map(p => ({ id: p.id, brand: p.brand, name: p.name, stock: p.stock })) },
    coupons: { total: d.coupons.length, active: d.coupons.filter(c => c.active).length },
    banners: { total: d.banners.length, live: d.banners.filter(b => b.active).length },
    blogs: { total: d.blogs.length, published: d.blogs.filter(b => b.published).length },
    checkouts: { abandoned: d.checkouts.filter(c => ['open', 'reminded'].includes(c.status) && Date.now() - +new Date(c.updatedAt) > d.settings.abandonAfterMin * 60000).length, recovered: d.checkouts.filter(c => c.status === 'recovered').length, value: d.checkouts.filter(c => ['open', 'reminded'].includes(c.status) && Date.now() - +new Date(c.updatedAt) > d.settings.abandonAfterMin * 60000).reduce((a, c) => a + c.total, 0) },
    reviews: { pending: d.reviews.filter(r => r.status === 'pending').length },
    series, recentOrders: o.slice(0, 6),
  };
}

export function analytics() {
  const d = db(); const o = d.orders; const live = o.filter(x => !['Cancelled', 'Returned'].includes(x.status));
  const days = Array.from({ length: 30 }, (_, i) => { const day = new Date(Date.now() - (29 - i) * 864e5); return { label: day.getDate() + '/' + (day.getMonth() + 1), revenue: live.filter(x => sameDay(x.date, day)).reduce((a, x) => a + x.total, 0), orders: o.filter(x => sameDay(x.date, day)).length }; });
  const units = new Map<string, { name: string; brand: string; units: number; revenue: number }>();
  for (const ord of live) for (const it of ord.items) { const k = String(it.productId); const e = units.get(k) || { name: it.name, brand: it.brand, units: 0, revenue: 0 }; e.units += it.qty; e.revenue += it.qty * it.price; units.set(k, e); }
  const pay = new Map<string, number>(); for (const x of live) pay.set(x.payment, (pay.get(x.payment) || 0) + 1);
  const coupons = new Map<string, number>(); for (const x of live) if (x.couponCode) coupons.set(x.couponCode, (coupons.get(x.couponCode) || 0) + 1);
  const carts = d.checkouts.length, reached = d.checkouts.filter(c => c.stage === 'checkout' || c.status === 'converted' || c.status === 'recovered').length, converted = d.checkouts.filter(c => ['converted', 'recovered'].includes(c.status)).length;
  const revenue = live.reduce((a, x) => a + x.total, 0);
  return {
    revenue, orders: live.length, aov: live.length ? Math.round(revenue / live.length) : 0, days,
    funnel: { carts, reached, converted, abandonedRate: carts ? Math.round(((carts - converted) / carts) * 100) : 0, recovered: d.checkouts.filter(c => c.status === 'recovered').length },
    topProducts: [...units.values()].sort((a, b) => b.units - a.units).slice(0, 8),
    payments: [...pay.entries()].map(([k, v]) => ({ method: k, orders: v })),
    coupons: [...coupons.entries()].map(([k, v]) => ({ code: k, uses: v })),
    wishlist: (() => { const m = new Map<number, number>(); for (const w of d.wishlists) for (const id of w.ids) m.set(id, (m.get(id) || 0) + 1); return [...m.entries()].map(([id, users]) => ({ id, users, name: d.products.find(p => p.id === id)?.name || '#' + id })).sort((a, b) => b.users - a.users).slice(0, 6); })(),
  };
}
