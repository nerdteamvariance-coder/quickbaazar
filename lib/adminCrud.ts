// Generic, validated CRUD used by /api/admin/[resource]. Add a resource in lib/resources.ts and it works.
import { db, save, nextId, logAction } from './store';
import { getResource, type Resource } from './resources';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const list = (r: Resource) => (db() as any)[r.collection] as any[];

export type Result = { status: number; body: any };
export const fail = (status: number, error: string, fields?: Record<string, string>): Result => ({ status, body: { error, ...(fields ? { fields } : {}) } });

/** Rows as the admin sees them: stored rows plus computed columns (customer totals, abandoned flag, wishlist counts…). */
export function viewRows(r: Resource): any[] {
  const d = db();
  switch (r.key) {
    case 'customers': return d.customers.map(c => { const mine = d.orders.filter(o => o.phone === c.phone && !['Cancelled', 'Returned'].includes(o.status)); return { ...c, orders: mine.length, spent: mine.reduce((a, o) => a + o.total, 0) }; });
    case 'orders': return d.orders.map(o => ({ ...o, customer: o.address?.name || '' }));
    case 'reviews': return d.reviews.map(v => ({ ...v, productName: d.products.find(p => p.id === v.productId)?.name || `#${v.productId}` }));
    case 'checkouts': { const idle = d.settings.abandonAfterMin * 60000; return d.checkouts.map(c => ({ ...c, itemsCount: c.items.reduce((a, i) => a + i.qty, 0), abandoned: ['open', 'reminded'].includes(c.status) && Date.now() - +new Date(c.updatedAt) > idle })); }
    case 'wishlists': {
      const m = new Map<number, number>(); for (const w of d.wishlists) for (const id of w.ids) m.set(id, (m.get(id) || 0) + 1);
      return [...m.entries()].map(([id, users]) => { const p = d.products.find(x => x.id === id); return p ? { id, brand: p.brand, name: p.name, image: p.image, price: p.price, stock: p.stock, users } : null; }).filter(Boolean).sort((a: any, b: any) => b.users - a.users);
    }
    default: return [...list(r)];
  }
}

function coerce(r: Resource, input: any, existing?: any): { data?: any; errors?: Record<string, string> } {
  const data: any = {}; const errors: Record<string, string> = {};
  for (const f of r.fields) {
    if (f.readonly || f.computed) continue;
    if (!(f.name in input)) { if (!existing && f.required && !(f.name in r.defaults) && f.name !== 'slug') errors[f.name] = `${f.label} is required`; continue; }
    let v = input[f.name];
    if (f.type === 'number') { v = v === '' || v === null ? 0 : Number(v); if (Number.isNaN(v)) { errors[f.name] = `${f.label} must be a number`; continue; } }
    else if (f.type === 'bool') v = v === true || (typeof v === 'string' && ['true', 'yes', '1', 'y', 'on', 'active', 'live', 'published'].includes(v.trim().toLowerCase())) || v === 1;
    else v = String(v ?? '').trim();
    if (f.required && (v === '' || v === undefined)) { errors[f.name] = `${f.label} is required`; continue; }
    if (f.type === 'select' && f.options && v !== '' && !f.options.includes(v)) { errors[f.name] = `${f.label} must be one of: ${f.options.join(', ')}`; continue; }
    data[f.name] = v;
  }
  return Object.keys(errors).length ? { errors } : { data };
}

function rules(r: Resource, data: any, existing?: any): Record<string, string> | null {
  const e: Record<string, string> = {};
  if (r.key === 'products') {
    const mrp = data.mrp ?? existing?.mrp, price = data.price ?? existing?.price;
    if (mrp !== undefined && mrp <= 0) e.mrp = 'MRP must be above 0';
    if (price !== undefined && price <= 0) e.price = 'Price must be above 0';
    if (mrp !== undefined && price !== undefined && price > mrp) e.price = 'Selling price can’t be higher than MRP';
    if (data.stock !== undefined && data.stock < 0) e.stock = 'Stock can’t be negative';
    if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) e.rating = 'Rating must be between 0 and 5';
  }
  if (r.key === 'coupons') {
    if (data.code !== undefined) data.code = data.code.toUpperCase().replace(/\s+/g, '');
    if (data.code && !/^[A-Z0-9_-]{3,20}$/.test(data.code)) e.code = 'Use 3–20 letters, numbers, - or _';
    const dup = data.code && list(r).find((x: any) => x.code === data.code && x.id !== existing?.id); if (dup) e.code = 'That code already exists';
    const t = data.type ?? existing?.type, v = data.value ?? existing?.value;
    if (t === 'percent' && (v <= 0 || v > 100)) e.value = 'Percent must be between 1 and 100';
    if (t === 'flat' && v <= 0) e.value = 'Flat amount must be above 0';
  }
  if (r.key === 'blogs') {
    if (data.title !== undefined && !data.slug && !existing?.slug) data.slug = slugify(data.title);
    if (data.slug !== undefined) data.slug = slugify(data.slug || data.title || existing?.title || '');
    const dup = data.slug && list(r).find((x: any) => x.slug === data.slug && x.id !== existing?.id); if (dup) e.slug = 'That URL slug is already used';
    if (!existing && !data.date) data.date = new Date().toISOString(); else if (data.date) { const t = new Date(data.date); if (Number.isNaN(+t)) e.date = 'Enter a valid date'; else data.date = t.toISOString(); }
  }
  if (r.key === 'banners' && data.href && !/^(\/|https?:\/\/)/.test(data.href)) e.href = 'Link must start with / or https://';
  if (r.key === 'subscribers') { if (!/.+@.+\..+/.test(data.email || '')) e.email = 'Enter a valid email'; else if (list(r).some((x: any) => x.email === data.email)) e.email = 'Already subscribed'; if (!existing) data.date = new Date().toISOString(); }
  if (r.key === 'coupons' && data.expiresAt) { const t = new Date(data.expiresAt); if (Number.isNaN(+t)) e.expiresAt = 'Enter a valid date'; else data.expiresAt = t.toISOString(); }
  return Object.keys(e).length ? e : null;
}

export function listItems(key: string, q: URLSearchParams): Result {
  const r = getResource(key); if (!r) return fail(404, 'Unknown resource');
  let rows = viewRows(r); const s = (q.get('q') || '').toLowerCase().trim();
  if (s) rows = rows.filter(x => r.search.some(k => String(x[k] ?? '').toLowerCase().includes(s)));
  const status = q.get('status');
  if (status) rows = rows.filter(x => (r.key === 'checkouts' && status === 'abandoned') ? x.abandoned : r.key === 'checkouts' && status === 'open' ? x.status === 'open' && !x.abandoned : x.status === status);
  const by = r.sortBy || 'id';
  if (r.key === 'wishlists') { /* already sorted by popularity */ }
  else if (by === 'sort') rows.sort((a, b) => a.sort - b.sort);
  else if (by === 'id') rows.sort((a, b) => b.id - a.id);
  else rows.sort((a, b) => String(b[by]).localeCompare(String(a[by])));
  if (r.key === 'logs') rows.sort((a, b) => b.id - a.id);
  const limit = Math.min(100, Number(q.get('limit')) || 10), page = Math.max(1, Number(q.get('page')) || 1);
  return { status: 200, body: { total: rows.length, page, limit, items: rows.slice((page - 1) * limit, page * limit) } };
}
export function getItem(key: string, id: string): Result {
  const r = getResource(key); if (!r) return fail(404, 'Unknown resource');
  const it = viewRows(r).find((x: any) => String(x.id) === id); return it ? { status: 200, body: it } : fail(404, `${r.singular} not found`);
}

type Opt = { silent?: boolean; dry?: boolean };
export function createItem(key: string, input: any, admin: string, o: Opt = {}): Result {
  const r = getResource(key); if (!r) return fail(404, 'Unknown resource'); if (!r.canCreate) return fail(405, `${r.label} can’t be created here`);
  const c = coerce(r, { ...r.defaults, ...input }); if (c.errors) return fail(422, 'Please fix the highlighted fields', c.errors);
  const data = c.data; const re = rules(r, data); if (re) return fail(422, 'Please fix the highlighted fields', re);
  if (o.dry) return { status: 201, body: data };
  const rows = list(r); const item = { id: nextId(rows), ...data }; if (r.key === 'products') item.gender = item.gender || 'men';
  rows.push(item); if (!o.silent) { save(); logAction(admin, 'created', r.key, item.id); } return { status: 201, body: item };
}
export function updateItem(key: string, id: string, input: any, admin: string, o: Opt = {}): Result {
  const r = getResource(key); if (!r) return fail(404, 'Unknown resource'); if (!r.canEdit) return fail(405, `${r.label} can’t be edited`);
  const it = list(r).find((x: any) => String(x.id) === id); if (!it) return fail(404, `${r.singular} not found`);
  const c = coerce(r, input, it); if (c.errors) return fail(422, 'Please fix the highlighted fields', c.errors);
  const data = c.data; const re = rules(r, data, it); if (re) return fail(422, 'Please fix the highlighted fields', re);
  if (o.dry) return { status: 200, body: data };
  Object.assign(it, data);
  if (r.key === 'checkouts' && data.status === 'reminded') it.remindedAt = new Date().toISOString();
  if (!o.silent) { save(); logAction(admin, 'updated', r.key, it.id); } return { status: 200, body: it };
}
export function deleteItem(key: string, id: string, admin: string, o: Opt = {}): Result {
  const r = getResource(key); if (!r) return fail(404, 'Unknown resource'); if (!r.canDelete) return fail(405, `${r.label} can’t be deleted`);
  const rows = list(r), i = rows.findIndex((x: any) => String(x.id) === id); if (i < 0) return fail(404, `${r.singular} not found`);
  rows.splice(i, 1); if (!o.silent) { save(); logAction(admin, 'deleted', r.key, id); } return { status: 200, body: { ok: true } };
}

/** Bulk actions: { action:'delete'|'set'|'priceAdjust', ids:[], field?, value?, percent? } */
export function bulk(key: string, body: any, admin: string): Result {
  const r = getResource(key); if (!r) return fail(404, 'Unknown resource'); if (!r.bulk) return fail(405, `${r.label} doesn’t support bulk actions`);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String) : [];
  if (!ids.length) return fail(400, 'Select at least one item');
  if (ids.length > 500) return fail(400, 'You can change at most 500 items at once');
  const errors: { id: string; error: string }[] = []; let affected = 0;
  const action = body.action;
  if (action === 'delete') {
    if (!r.canDelete) return fail(405, `${r.label} can’t be deleted`);
    for (const id of ids) { const x = deleteItem(key, id, admin, { silent: true }); x.status === 200 ? affected++ : errors.push({ id, error: x.body.error }); }
  } else if (action === 'set') {
    const f = r.fields.find(x => x.name === body.field);
    if (!f || f.readonly || f.computed || !r.canEdit || !['bool', 'select'].includes(f.type)) return fail(400, 'That field can’t be changed in bulk');
    for (const id of ids) { const x = updateItem(key, id, { [f.name]: body.value }, admin, { silent: true }); x.status === 200 ? affected++ : errors.push({ id, error: x.body.fields ? Object.values(x.body.fields).join(', ') : x.body.error }); }
  } else if (action === 'priceAdjust') {
    if (key !== 'products') return fail(400, 'Price adjustment is only for products');
    const pct = Number(body.percent); if (!Number.isFinite(pct) || pct < -90 || pct > 500 || pct === 0) return fail(422, 'Enter a percentage between -90 and 500 (not 0)', { percent: 'Between -90 and 500' });
    for (const id of ids) {
      const p = list(r).find((x: any) => String(x.id) === id); if (!p) { errors.push({ id, error: 'Product not found' }); continue; }
      const price = Math.max(1, Math.round(p.price * (1 + pct / 100)));
      const mrp = pct > 0 && price > p.mrp ? price : p.mrp; // raise MRP with the price so MRP never sits below the selling price
      const x = updateItem(key, id, { price, mrp }, admin, { silent: true }); x.status === 200 ? affected++ : errors.push({ id, error: Object.values(x.body.fields || {}).join(', ') || x.body.error });
    }
  } else return fail(400, 'Unknown bulk action');
  save(); logAction(admin, `bulk ${action}${body.field ? ` ${body.field}=${body.value}` : ''}`, r.key, `${affected} items`);
  return { status: 200, body: { affected, failed: errors.length, errors: errors.slice(0, 50) } };
}
