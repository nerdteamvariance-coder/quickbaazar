// CSV export / import for admin collections, including product images by URL.
import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';
import net from 'net';
import { db, save, logAction } from './store';
import { getResource, type Resource, type Field } from './resources';
import { imgUrl } from './data';
import { parseCsv, toCsv } from './csv';
import { UPLOAD_DIR } from './paths';
import { viewRows, createItem, updateItem } from './adminCrud';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const ALIASES: Record<string, string> = { imageurl: 'image', images: 'image', photo: 'image', sellingprice: 'price', saleprice: 'price', visible: 'active', visibleinstore: 'active', inventory: 'stock', quantity: 'stock', productname: 'name', title: 'name', vendor: 'brand' };

/* ---------------- export ---------------- */
function exportColumns(r: Resource): Field[] {
  const idField: Field = { name: 'id', label: 'id', type: 'text' };
  const skip = new Set(['logs']);
  const f = r.fields.filter(x => !(x.type === 'image' && x.computed && skip.has(r.key)));
  return [idField, ...f.filter(x => x.name !== 'id')];
}
const absImage = (v: string, origin: string) => (!v ? '' : v.startsWith('/') ? origin + v : /^https?:\/\//.test(v) ? v : imgUrl(v, 1200));

export function exportCsv(key: string, origin: string, ids?: string[]): { filename: string; csv: string } | null {
  const r = getResource(key); if (!r) return null;
  let rows = viewRows(r); if (ids?.length) { const s = new Set(ids); rows = rows.filter(x => s.has(String(x.id))); }
  const cols = exportColumns(r);
  const extra = key === 'orders' ? ['items', 'ship_to', 'city', 'pincode'] : key === 'checkouts' ? ['items', 'recovery_link'] : [];
  const header = [...cols.map(c => c.name), ...extra];
  const body = rows.map(row => {
    const base = cols.map(c => (c.type === 'image' ? absImage(row[c.name], origin) : row[c.name] ?? ''));
    if (key === 'orders') return [...base, (row.items || []).map((i: any) => `${i.brand} ${i.name} (${i.size}) x${i.qty}`).join(' | '), `${row.address?.name || ''}, ${row.address?.line1 || ''}`, row.address?.city || '', row.address?.pin || ''];
    if (key === 'checkouts') return [...base, (row.items || []).map((i: any) => `${i.brand} ${i.name} (${i.size}) x${i.qty}`).join(' | '), `${origin}/recover/${row.token}`];
    return base;
  });
  return { filename: `${key}-${new Date().toISOString().slice(0, 10)}.csv`, csv: toCsv(header, body) };
}
export function templateCsv(key: string): string | null {
  const r = getResource(key); if (!r) return null;
  const cols = exportColumns(r).filter(c => !c.readonly && !c.computed || c.name === 'id');
  const sample: Record<string, Record<string, any>> = {
    products: { id: '', image: 'https://example.com/photos/tee.jpg', brand: 'Roadster', name: 'Cotton Boxy Tee', category: 'men', gender: 'men', mrp: 1499, price: 599, stock: 100, tag: 'New', rating: 4.3, ratings: 0, description: 'Soft cotton tee', active: 'true' },
    coupons: { code: 'SAVE20', title: '20% off', type: 'percent', value: 20, max: 500, minOrder: 1500, active: 'true' },
    banners: { image: 'https://example.com/banner.jpg', title: 'Monsoon *sale*', href: '/shop/women', placement: 'hero', sort: 1, active: 'true' },
    blogs: { title: 'Style guide', content: 'First paragraph.\n\nSecond paragraph.', author: 'Editorial', published: 'true' },
    subscribers: { email: 'someone@example.com' },
  };
  return toCsv(cols.map(c => c.name), [cols.map(c => sample[key]?.[c.name] ?? '')]);
}

/* ---------------- image download (SSRF-guarded) ---------------- */
const IMG_EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif' };
function privateIp(ip: string) {
  if (net.isIPv6(ip)) { const l = ip.toLowerCase(); return l === '::1' || l === '::' || l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe80') || l.startsWith('::ffff:127.') || l.startsWith('::ffff:10.') || l.startsWith('::ffff:192.168.'); }
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}
export async function downloadImage(url: string): Promise<string> {
  const u = new URL(url);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http(s) image URLs are allowed');
  const addrs = await dns.lookup(u.hostname, { all: true });
  if (!addrs.length || addrs.some(a => privateIp(a.address))) throw new Error('That address isn’t a public website');
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 9000);
  try {
    const res = await fetch(u, { redirect: 'manual', signal: ctl.signal, headers: { 'User-Agent': 'QuickBaazarImporter/1.0' } });
    if (res.status >= 300 && res.status < 400) throw new Error('Image URL redirects — use the final image address');
    if (!res.ok) throw new Error(`Image download failed (${res.status})`);
    const type = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (!IMG_EXT[type]) throw new Error('URL is not a JPG, PNG, WebP, GIF or AVIF image');
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 5 * 1024 * 1024) throw new Error('Image is larger than 5 MB');
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${IMG_EXT[type]}`;
    const dir = UPLOAD_DIR; fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buf); return '/uploads/' + name;
  } catch (e: any) { throw new Error(e.name === 'AbortError' ? 'Image download timed out' : e.message); }
  finally { clearTimeout(t); }
}

/* ---------------- import ---------------- */
export type ImportOpts = { dryRun?: boolean; fetchImages?: boolean; origin: string; admin: string };
export type ImportResult = { total: number; created: number; updated: number; failed: number; imagesDownloaded: number; dryRun: boolean; errors: { row: number; error: string }[] };

export async function importCsv(key: string, text: string, o: ImportOpts): Promise<{ status: number; body: any }> {
  const r = getResource(key); if (!r || !r.io) return { status: 404, body: { error: 'Unknown resource' } };
  if (!r.canCreate) return { status: 405, body: { error: `${r.label} can’t be imported` } };
  const table = parseCsv(text);
  if (table.length < 2) return { status: 422, body: { error: 'The file needs a header row and at least one data row' } };
  if (table.length - 1 > 2000) return { status: 422, body: { error: 'Import up to 2,000 rows at a time' } };
  const map = new Map<string, string>(); // normalised header -> field name
  for (const f of [{ name: 'id', label: 'id' }, ...r.fields]) { map.set(norm(f.name), f.name); map.set(norm(f.label), f.name); }
  for (const [a, b] of Object.entries(ALIASES)) if (r.fields.some(f => f.name === b)) map.set(a, b);
  const header = table[0].map(h => map.get(norm(h)) || null);
  if (!header.some(h => h && h !== 'id')) return { status: 422, body: { error: `No recognised columns. Expected headers like: ${r.fields.filter(f => !f.readonly && !f.computed).map(f => f.name).join(', ')}` } };
  const missing = r.fields.filter(f => f.required && !f.readonly && !f.computed && !(f.name in r.defaults) && f.name !== 'slug' && !header.includes(f.name)).map(f => f.name);
  if (missing.length) return { status: 422, body: { error: `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}` } };

  const res: ImportResult = { total: table.length - 1, created: 0, updated: 0, failed: 0, imagesDownloaded: 0, dryRun: !!o.dryRun, errors: [] };
  const stored = (db() as any)[r.collection] as any[];
  const bad = (row: number, error: string) => { res.failed++; if (res.errors.length < 100) res.errors.push({ row, error }); };
  let downloads = 0; const seen = new Map<string, any>();

  for (let i = 1; i < table.length; i++) {
    const line = i + 1; const input: Record<string, any> = {};
    header.forEach((h, c) => { if (h) { let v = (table[i][c] ?? '').trim(); if (/^'[=+@-]/.test(v)) v = v.slice(1); input[h] = v; } });
    // image handling
    const imgField = r.fields.find(f => f.type === 'image');
    if (imgField && input[imgField.name]) {
      let v: string = input[imgField.name];
      if (v.startsWith(o.origin + '/')) v = v.slice(o.origin.length);
      if (/^https?:\/\//.test(v)) {
        if (o.fetchImages && !o.dryRun) {
          if (downloads >= 200) { bad(line, 'Image download limit (200 per import) reached — import the rest in another file'); continue; }
          try { v = await downloadImage(v); res.imagesDownloaded++; downloads++; } catch (e: any) { bad(line, `Image: ${e.message}`); continue; }
        } else { try { const u = new URL(v); if (!['http:', 'https:'].includes(u.protocol)) throw new Error(); } catch { bad(line, 'Image URL isn’t valid'); continue; } }
      }
      input[imgField.name] = v;
    }
    // find an existing row: by id, else by the resource's unique columns
    let existing: any;
    if (input.id) existing = stored.find(x => String(x.id) === String(input.id));
    if (!existing && r.unique?.length && r.unique.every(k => input[k])) existing = stored.find(x => r.unique!.every(k => String(x[k]).toLowerCase() === String(input[k]).toLowerCase()));
    delete input.id;
    const sig = r.unique?.length && r.unique.every(k => input[k]) ? r.unique.map(k => String(input[k]).toLowerCase()).join('|') : '';
    if (!existing && sig && seen.has(sig)) existing = seen.get(sig);
    const placeholder = existing && String(existing.id).startsWith('dry-'); // duplicate of a row created earlier in this same dry run
    const out = existing && !placeholder ? updateItem(key, String(existing.id), input, o.admin, { silent: true, dry: o.dryRun }) : createItem(key, input, o.admin, { silent: true, dry: o.dryRun });
    if (out.status >= 400) { bad(line, out.body.fields ? Object.values(out.body.fields).join(', ') : out.body.error); continue; }
    existing ? res.updated++ : res.created++;
    if (sig && !existing) seen.set(sig, o.dryRun ? { id: `dry-${line}` } : out.body);
  }
  if (!o.dryRun) { save(); logAction(o.admin, `imported ${res.created} new, ${res.updated} updated`, r.key, `${res.total} rows`); }
  return { status: 200, body: res };
}
