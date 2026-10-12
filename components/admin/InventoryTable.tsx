'use client';
import { useCallback, useEffect, useState } from 'react';
import { imgUrl } from '@/lib/data';

type P = { id: number; brand: string; name: string; image: string; stock: number; active?: boolean };
export default function InventoryTable({ low }: { low: number }) {
  const [rows, setRows] = useState<P[]>([]); const [q, setQ] = useState(''); const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all'); const [saved, setSaved] = useState<number | null>(null); const [err, setErr] = useState('');
  const load = useCallback(async () => { const r = await fetch('/api/admin/products?limit=100&q=' + encodeURIComponent(q)); if (r.status === 401) { location.href = '/admin/login'; return; } const j = await r.json(); setRows(j.items || []); }, [q]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  const commit = async (p: P, v: string) => {
    const n = Number(v); if (v === '' || Number.isNaN(n) || n < 0) { setErr('Stock must be 0 or more'); load(); return; }
    if (n === p.stock) return; setErr('');
    const r = await fetch(`/api/admin/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: n }) });
    if (r.ok) { setSaved(p.id); setTimeout(() => setSaved(null), 1500); setRows(rs => rs.map(x => (x.id === p.id ? { ...x, stock: n } : x))); } else setErr((await r.json()).error || 'Could not save');
  };
  const shown = rows.filter(p => (filter === 'low' ? p.stock > 0 && p.stock <= low : filter === 'out' ? p.stock <= 0 : true));
  return (
    <>
      <div className="tbar"><h1>Inventory</h1><label className="asearch"><span style={{ color: 'var(--mute)' }}>⌕</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" /></label></div>
      <div className="atabs">{([['all', 'All'], ['low', `Low (≤ ${low})`], ['out', 'Out of stock']] as const).map(([k, l]) => <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>)}</div>
      {err && <p style={{ color: 'var(--bad)', fontWeight: 600, marginBottom: 10 }}>{err}</p>}
      <div className="tw inv"><table><thead><tr><th /><th>Product</th><th>Status</th><th>Stock (edit and click away to save)</th></tr></thead>
        <tbody>{!shown.length && <tr><td colSpan={4} className="aempty">No products match.</td></tr>}
          {shown.map(p => (
            <tr key={p.id}><td style={{ width: 70 }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="thumb" src={imgUrl(p.image, 120)} alt="" /></td>
              <td><b>{p.brand}</b><br /><small style={{ color: 'var(--mute)' }}>{p.name}</small></td>
              <td><span className={'abadge ' + (p.stock <= 0 ? 'bad' : p.stock <= low ? 'warn' : 'ok')}>{p.stock <= 0 ? 'Out of stock' : p.stock <= low ? 'Low stock' : 'In stock'}</span></td>
              <td><input className="n" type="number" min={0} defaultValue={p.stock} key={p.id + '-' + p.stock} onBlur={e => commit(p, e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />{saved === p.id && <span className="saved">Saved ✓</span>}</td></tr>))}</tbody></table></div>
    </>
  );
}
