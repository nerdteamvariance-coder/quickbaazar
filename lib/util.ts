import type { Product } from './data';
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
export const disc = (p: Product) => Math.round((1 - p.price / p.mrp) * 100);
export const GRAD = ['#ffd6e0,#ffb199', '#dcd3ff,#b6a4ff', '#c7f0e1,#8fd9c0', '#ffe7b3,#ffb36b', '#cfe3ff,#9dbdff'];
export const grad = (i: number) => `linear-gradient(160deg,${GRAD[i % 5]})`;
export const SWC = ['#16121f', '#e8dfd0', '#c24d4d', '#2f6fed', '#2e9e6b', '#f0a43b'];
export const swatches = (p: Product) => [0, 1, 2].map(k => SWC[(p.id + k * 2) % 6]);
export const sizesFor = (p: Product) => (p.category === 'footwear' ? ['6', '7', '8', '9', '10', '11'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL']);
export const deliveryDate = (days = 5) => new Date(Date.now() + days * 864e5).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, credentials: 'same-origin' });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Something went wrong');
  return j;
}

/** Escape HTML, then turn *word* into <em>word</em> (used for admin-entered headlines). */
export const emph = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*(.+?)\*/g, '<em>$1</em>');
