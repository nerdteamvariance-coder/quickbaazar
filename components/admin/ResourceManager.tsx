'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getResource, type Field, type Resource } from '@/lib/resources';
import { imgUrl } from '@/lib/data';

type Row = Record<string, any>;
const inr = (n: number) => '₹' + Number(n).toLocaleString('en-IN');
const fmtDate = (v: string, time = false) => (v ? new Date(v).toLocaleString('en-IN', time ? { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' } : { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const statusTone = (s: string) => ({ Delivered: 'ok', resolved: 'ok', approved: 'ok', recovered: 'ok', converted: 'ok', Shipped: 'blue', 'Out for delivery': 'blue', reminded: 'blue', Placed: 'warn', Packed: 'warn', new: 'warn', pending: 'warn', open: 'warn', Cancelled: 'bad', Returned: 'bad' } as Record<string, string>)[s] || '';

async function call(path: string, method = 'GET', body?: any) {
  const r = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { location.href = '/admin/login'; throw new Error('Session expired'); }
  if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong'), { fields: j.fields });
  return j;
}

function Cell({ f, row, resource }: { f: Field; row: Row; resource: string }) {
  const v = row[f.name];
  if (f.type === 'image') return v ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="thumb" src={imgUrl(v, 120)} alt="" /> : <span className="thumb" />;
  if (f.type === 'bool') return <span className={'abadge ' + (v ? 'ok' : '')}>{v ? 'Yes' : 'No'}</span>;
  if (f.type === 'date') return <>{fmtDate(v, f.name === 'updatedAt' || resource === 'logs')}</>;
  if (f.name === 'status') return <><span className={'abadge ' + statusTone(v)}>{v}</span>{row.abandoned && <span className="abadge bad" style={{ marginLeft: 6 }}>abandoned</span>}</>;
  if (f.name === 'rating' && resource === 'reviews') return <span style={{ color: '#e0a100', letterSpacing: 1 }}>{'★'.repeat(v)}</span>;
  if (f.type === 'number' && /price|mrp|total|max|minOrder|spent/i.test(f.name)) return <>{inr(v)}</>;
  if (['type', 'placement', 'category', 'stage'].includes(f.name)) return <span className="abadge">{v}</span>;
  return <span className="clip" style={{ display: 'block' }}>{String(v ?? '')}</span>;
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const ref = useRef<HTMLInputElement>(null);
  const upload = async (file: File) => {
    setBusy(true); setErr('');
    try { const fd = new FormData(); fd.append('file', file); const r = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'same-origin' }); const j = await r.json(); if (!r.ok) throw new Error(j.error); onChange(j.url); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="aimg">
      <div className="pv">{value ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={imgUrl(value, 300)} alt="" /> : 'No image'}</div>
      <div className="ctl">
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Paste an image URL…" />
        <div><input ref={ref} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
          <button type="button" className="btn ghost sm" disabled={busy} onClick={() => ref.current?.click()}>{busy ? 'Uploading…' : 'Upload image'}</button>
          {value && <button type="button" className="btn ghost sm" style={{ marginLeft: 8 }} onClick={() => onChange('')}>Remove</button>}</div>
        {err && <span className="em" style={{ color: 'var(--bad)', fontSize: 12.5, fontWeight: 600 }}>{err}</span>}
      </div>
    </div>
  );
}

function FieldInput({ f, value, onChange, error, readonly }: { f: Field; value: any; onChange: (v: any) => void; error?: string; readonly?: boolean }) {
  const ro = readonly || f.readonly || f.computed;
  let input;
  if (f.type === 'image') input = ro ? <div className="aimg"><div className="pv">{value ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={imgUrl(value, 300)} alt="" /> : '—'}</div></div> : <ImageField value={value} onChange={onChange} />;
  else if (f.type === 'bool') input = <label className="tg"><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} /><span /><b>{value ? 'On' : 'Off'}</b></label>;
  else if (f.type === 'select') input = <select value={value ?? ''} disabled={ro} onChange={e => onChange(e.target.value)}>{!value && <option value="">Select…</option>}{f.options!.map(o => <option key={o}>{o}</option>)}</select>;
  else if (f.type === 'textarea') input = <textarea value={value ?? ''} readOnly={ro} onChange={e => onChange(e.target.value)} placeholder={f.placeholder} />;
  else if (f.type === 'date') input = <input type="date" readOnly={ro} value={value ? String(value).slice(0, 10) : ''} onChange={e => onChange(e.target.value)} />;
  else input = <input type={f.type === 'number' ? 'number' : 'text'} step="any" readOnly={ro} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={f.placeholder} />;
  return (
    <div className={'f' + (f.wide || f.type === 'textarea' || f.type === 'image' ? ' wide' : '') + (error ? ' err' : '')}>
      <label>{f.label}{f.required && !ro && <i> *</i>}</label>{input}
      {error ? <span className="em">{error}</span> : f.help ? <span className="hp">{f.help}</span> : null}
    </div>
  );
}

type ImportResult = { total: number; created: number; updated: number; failed: number; imagesDownloaded: number; dryRun: boolean; errors: { row: number; error: string }[] };

function ImportModal({ R, onClose, onDone }: { R: Resource; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null); const [fetchImages, setFetchImages] = useState(false);
  const [busy, setBusy] = useState(false); const [res, setRes] = useState<ImportResult | null>(null); const [err, setErr] = useState('');
  const hasImage = R.fields.some(f => f.type === 'image');
  const run = async (dry: boolean) => {
    if (!file) { setErr('Choose a CSV file first'); return; }
    setBusy(true); setErr(''); setRes(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch(`/api/admin/${R.key}/import?dryRun=${dry ? 1 : 0}&fetchImages=${fetchImages ? 1 : 0}`, { method: 'POST', body: fd, credentials: 'same-origin' });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Import failed'); setRes(j); if (!dry && j.failed < j.total) onDone();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="modal" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="dwr" style={{ width: 'min(620px,100%)' }}>
        <header><h3>Import {R.label.toLowerCase()} from CSV</h3><button className="btn ghost sm" onClick={onClose}>Close</button></header>
        <div style={{ padding: 22, display: 'grid', gap: 16, alignContent: 'start', flex: 1 }}>
          <p style={{ color: 'var(--mute)' }}>Rows that match an existing {R.unique ? R.unique.join(' + ') + ' or ' : ''}id are <b>updated</b>; the rest are <b>created</b>. Download the template to see the columns.
            {hasImage && <> Put a full image URL in the <b>image</b> column.</>}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="btn ghost sm" href={`/api/admin/${R.key}/export?template=1`}>⬇ Download template</a>
            <a className="btn ghost sm" href={`/api/admin/${R.key}/export`}>⬇ Export current data</a></div>
          <div className="f"><label>CSV file (max 4 MB, 2,000 rows)</label><input type="file" accept=".csv,text/csv" onChange={e => { setFile(e.target.files?.[0] || null); setRes(null); }} /></div>
          {hasImage && <label className="tg"><input type="checkbox" checked={fetchImages} onChange={e => setFetchImages(e.target.checked)} /><span /><b style={{ fontWeight: 600 }}>Download images from their URLs onto my server <small style={{ color: 'var(--mute)' }}>(up to 200 per import)</small></b></label>}
          {err && <div className="f err"><span className="em">{err}</span></div>}
          {res && (
            <div style={{ background: res.failed ? '#fff7e6' : '#e8f8f0', borderRadius: 12, padding: 14 }}>
              <b>{res.dryRun ? 'Preview — nothing saved yet' : 'Import finished'}</b>
              <div style={{ marginTop: 6 }}>{res.total} rows · <span style={{ color: 'var(--ok)', fontWeight: 700 }}>{res.created} new</span> · {res.updated} updated · <span style={{ color: res.failed ? 'var(--bad)' : 'inherit', fontWeight: 700 }}>{res.failed} with errors</span>{res.imagesDownloaded ? ` · ${res.imagesDownloaded} images downloaded` : ''}</div>
              {res.errors.length > 0 && <ul style={{ marginTop: 10, paddingLeft: 18, maxHeight: 180, overflow: 'auto', fontSize: 13 }}>{res.errors.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}</ul>}
            </div>)}
        </div>
        <footer><button className="btn ghost" disabled={busy} onClick={() => run(true)}>Preview (check only)</button><button className="btn" disabled={busy} onClick={() => run(false)}>{busy ? 'Working…' : 'Import now'}</button></footer>
      </div>
    </div>
  );
}

export default function ResourceManager({ resource }: { resource: string }) {
  const R = getResource(resource) as Resource;
  const [rows, setRows] = useState<Row[]>([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [limit, setLimit] = useState(10);
  const [q, setQ] = useState(''); const [tab, setTab] = useState(R.key === 'checkouts' ? 'abandoned' : R.key === 'reviews' ? 'pending' : ''); const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Row | null>(null); const [isNew, setIsNew] = useState(false); const [importing, setImporting] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({}); const [saving, setSaving] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set()); const [msgTpl, setMsgTpl] = useState('');
  const [toast, setToast] = useState<{ m: string; bad?: boolean } | null>(null);
  const say = (m: string, bad = false) => { setToast({ m, bad }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try { const p = new URLSearchParams({ page: String(page), limit: String(limit), q }); if (tab) p.set('status', tab); const j = await call(`/api/admin/${resource}?${p}`); setRows(j.items); setTotal(j.total); }
    catch (e: any) { say(e.message, true); } finally { setLoading(false); }
  }, [resource, page, limit, q, tab]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => { setPage(1); setSel(new Set()); }, [q, tab, limit]);
  useEffect(() => { if (resource === 'checkouts') call('/api/admin/settings').then(s => setMsgTpl(s.recoveryMessage)).catch(() => {}); }, [resource]);

  const open = (row?: Row) => { setErrs({}); setIsNew(!row); setEdit(row ? { ...row } : { ...R.defaults }); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!edit) return; setSaving(true); setErrs({});
    try {
      if (isNew) await call(`/api/admin/${resource}`, 'POST', edit); else await call(`/api/admin/${resource}/${edit.id}`, 'PUT', edit);
      setEdit(null); say(isNew ? `${R.singular} created` : `${R.singular} saved`); load();
    } catch (er: any) { setErrs(er.fields || {}); say(er.message, true); } finally { setSaving(false); }
  };
  const del = async (row: Row) => {
    if (!confirm(`Delete this ${R.singular.toLowerCase()}? This can’t be undone.`)) return;
    try { await call(`/api/admin/${resource}/${row.id}`, 'DELETE'); say(`${R.singular} deleted`); load(); } catch (e: any) { say(e.message, true); }
  };
  const quick = async (row: Row, patch: Row) => { try { await call(`/api/admin/${resource}/${row.id}`, 'PUT', patch); load(); } catch (e: any) { say(e.message, true); } };

  /* ---- bulk ---- */
  const ids = [...sel];
  const bulk = async (body: any, label: string) => {
    try { const j = await call(`/api/admin/${resource}/bulk`, 'POST', { ids, ...body }); say(`${label}: ${j.affected} updated${j.failed ? `, ${j.failed} failed (${j.errors[0]?.error})` : ''}`, !!j.failed && !j.affected); setSel(new Set()); load(); }
    catch (e: any) { say(e.message, true); }
  };
  const bulkDelete = () => { if (confirm(`Delete ${ids.length} selected ${ids.length === 1 ? R.singular.toLowerCase() : R.label.toLowerCase()}? This can’t be undone.`)) bulk({ action: 'delete' }, 'Deleted'); };
  const toggleField = R.fields.find(f => f.type === 'bool' && !f.readonly && !f.computed);
  const statusField = R.fields.find(f => f.name === 'status' && f.type === 'select' && !f.readonly);
  const allOnPage = rows.length > 0 && rows.every(r => sel.has(String(r.id)));
  const toggleAll = () => setSel(allOnPage ? new Set() : new Set([...sel, ...rows.map(r => String(r.id))]));
  const toggleOne = (id: string) => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* ---- abandoned checkouts ---- */
  const recoveryLink = (row: Row) => `${location.origin}/recover/${row.token}`;
  const recoveryText = (row: Row) => (msgTpl || 'Hi {name}, you left {items} in your QuickBaazar bag. Complete your order here: {link}')
    .replace('{name}', row.name || 'there').replace('{items}', row.items?.[0] ? `${row.items[0].brand} ${row.items[0].name}${row.items.length > 1 ? ` + ${row.items.length - 1} more` : ''}` : 'your items').replace('{link}', recoveryLink(row));
  const copyLink = async (row: Row) => { await navigator.clipboard?.writeText(recoveryLink(row)); say('Recovery link copied'); };
  const whatsapp = async (row: Row) => { const num = String(row.phone || '').replace(/\D/g, '').slice(-10); window.open(`https://wa.me/91${num}?text=${encodeURIComponent(recoveryText(row))}`, '_blank'); if (row.status === 'open') await quick(row, { status: 'reminded' }); };

  const cols = R.fields.filter(f => f.list);
  const pages = Math.max(1, Math.ceil(total / limit));
  const fields = isNew ? R.fields.filter(f => !f.readonly && !f.computed) : R.fields.filter(f => !(f.computed && f.type !== 'image' && resource !== 'reviews'));
  const hasActions = R.canEdit || R.canDelete || resource === 'checkouts';
  const colCount = cols.length + (R.bulk ? 1 : 0) + (hasActions ? 1 : 0);
  const exportHref = `/api/admin/${resource}/export${sel.size ? `?ids=${ids.join(',')}` : ''}`;

  return (
    <>
      <div className="tbar">
        <h1>{R.label}</h1>
        <label className="asearch"><span style={{ color: 'var(--mute)' }}>⌕</span><input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${R.label.toLowerCase()}…`} /></label>
        {R.io && <a className="btn ghost" href={exportHref}>⬇ Export{sel.size ? ` (${sel.size})` : ''}</a>}
        {R.io && R.canCreate && <button className="btn ghost" onClick={() => setImporting(true)}>⬆ Import</button>}
        {R.canCreate && <button className="btn" onClick={() => open()}>+ Add {R.singular.toLowerCase()}</button>}
      </div>
      {R.tabs && <div className="atabs"><button className={tab === '' ? 'on' : ''} onClick={() => setTab('')}>All</button>{R.tabs.map(t => <button key={t.value} className={tab === t.value ? 'on' : ''} onClick={() => setTab(t.value)}>{t.label}</button>)}</div>}

      {sel.size > 0 && (
        <div className="bulkbar">
          <b>{sel.size} selected</b>
          {toggleField && R.canEdit && <><button className="btn ghost sm" onClick={() => bulk({ action: 'set', field: toggleField.name, value: true }, `${toggleField.label} on`)}>Turn on</button><button className="btn ghost sm" onClick={() => bulk({ action: 'set', field: toggleField.name, value: false }, `${toggleField.label} off`)}>Turn off</button></>}
          {statusField && R.canEdit && <select defaultValue="" onChange={e => { if (e.target.value) bulk({ action: 'set', field: 'status', value: e.target.value }, `Status → ${e.target.value}`); e.target.value = ''; }}><option value="">Set status…</option>{statusField.options!.map(o => <option key={o}>{o}</option>)}</select>}
          {resource === 'products' && <button className="btn ghost sm" onClick={() => { const v = prompt('Change selling price by what percent? (e.g. -10 for 10% off, 5 for 5% up)'); if (v !== null && v.trim() !== '') bulk({ action: 'priceAdjust', percent: Number(v) }, 'Prices adjusted'); }}>Adjust price %</button>}
          {R.canDelete && <button className="btn danger sm" onClick={bulkDelete}>Delete</button>}
          <button className="btn ghost sm" style={{ marginLeft: 'auto' }} onClick={() => setSel(new Set())}>Clear</button>
        </div>)}

      <div className="tw">
        <table>
          <thead><tr>{R.bulk && <th style={{ width: 40 }}><input type="checkbox" aria-label="Select all" checked={allOnPage} onChange={toggleAll} /></th>}
            {cols.map(c => <th key={c.name}>{c.type === 'image' ? '' : c.label}</th>)}{hasActions && <th />}</tr></thead>
          <tbody>
            {loading && !rows.length && <tr><td colSpan={colCount} className="aempty">Loading…</td></tr>}
            {!loading && !rows.length && <tr><td colSpan={colCount} className="aempty">Nothing here yet{R.canCreate ? ` — add your first ${R.singular.toLowerCase()}.` : '.'}</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className={sel.has(String(r.id)) ? 'sel' : ''}>
                {R.bulk && <td><input type="checkbox" aria-label="Select row" checked={sel.has(String(r.id))} onChange={() => toggleOne(String(r.id))} /></td>}
                {cols.map(c => <td key={c.name}>
                  {c.type === 'bool' && R.canEdit && !c.readonly
                    ? <label className="tg"><input type="checkbox" checked={!!r[c.name]} onChange={e => quick(r, { [c.name]: e.target.checked })} /><span /></label>
                    : <Cell f={c} row={r} resource={resource} />}</td>)}
                {hasActions && <td><div className="acts">
                  {resource === 'checkouts' && <>
                    <button className="btn ghost sm" onClick={() => copyLink(r)}>Copy link</button>
                    {r.phone && <button className="btn sm" onClick={() => whatsapp(r)}>WhatsApp</button>}</>}
                  {R.canEdit && <button className="btn ghost sm" onClick={() => open(r)}>{resource === 'orders' || resource === 'checkouts' ? 'View' : 'Edit'}</button>}
                  {R.canDelete && <button className="btn danger sm" onClick={() => del(r)}>Delete</button>}</div></td>}
              </tr>))}
          </tbody>
        </table>
      </div>
      <div className="pager"><span>{total} {total === 1 ? 'item' : 'items'}</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="pp" value={limit} onChange={e => setLimit(Number(e.target.value))} aria-label="Rows per page">{[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}</select>
          <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>Page {page} of {pages}<button className="btn ghost sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next ›</button></span></div>

      {edit && (
        <div className="modal" onMouseDown={e => e.target === e.currentTarget && setEdit(null)}>
          <div className="dwr">
            <header><h3>{isNew ? `Add ${R.singular.toLowerCase()}` : resource === 'orders' ? `Order ${edit.id}` : resource === 'checkouts' ? `Checkout ${edit.name || edit.phone || '#' + edit.id}` : `Edit ${R.singular.toLowerCase()}`}</h3><button className="btn ghost sm" onClick={() => setEdit(null)}>Close</button></header>
            <form id="rf" onSubmit={save}>
              {fields.map(f => <FieldInput key={f.name} f={f} value={edit[f.name]} error={errs[f.name]} readonly={!R.canEdit} onChange={v => setEdit({ ...edit, [f.name]: v })} />)}
              {(resource === 'orders' || resource === 'checkouts') && edit.items && (
                <div className="f wide"><label>Items</label>
                  <table style={{ minWidth: 0 }}><tbody>{edit.items.map((it: any, i: number) => <tr key={i}><td style={{ padding: '8px 0' }}>{it.brand} — {it.name}<br /><small style={{ color: 'var(--mute)' }}>Size {it.size} · Qty {it.qty}</small></td><td style={{ textAlign: 'right' }}>{inr(it.price * it.qty)}</td></tr>)}</tbody></table>
                  {resource === 'orders' && <span className="hp">Ship to: {edit.address?.name}, {edit.address?.line1}, {edit.address?.city} {edit.address?.pin}{edit.address?.email ? ` · ${edit.address.email}` : ''}{edit.couponCode ? ` · Coupon ${edit.couponCode}` : ''}</span>}
                  {resource === 'checkouts' && <span className="hp">Recovery link: <a style={{ color: 'var(--amber)' }} href={recoveryLink(edit)} target="_blank" rel="noreferrer">{recoveryLink(edit)}</a></span>}</div>)}
            </form>
            <footer><button type="button" className="btn ghost" onClick={() => setEdit(null)}>Cancel</button>{R.canEdit && <button form="rf" className="btn" disabled={saving}>{saving ? 'Saving…' : isNew ? `Create ${R.singular.toLowerCase()}` : 'Save changes'}</button>}</footer>
          </div>
        </div>)}
      {importing && <ImportModal R={R} onClose={() => setImporting(false)} onDone={load} />}
      {toast && <div className={'atoast' + (toast.bad ? ' bad' : '')} role="status">{toast.m}</div>}
    </>
  );
}
