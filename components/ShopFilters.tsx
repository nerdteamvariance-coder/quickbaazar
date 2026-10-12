'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useStore } from './Store';

const SORTS: [string, string][] = [['rec', 'Recommended'], ['off', 'Better discount'], ['rate', 'Customer rating'], ['lo', 'Price: low to high'], ['hi', 'Price: high to low']];

function useParams() {
  const sp = useSearchParams(); const router = useRouter(); const path = usePathname();
  const push = (mut: (u: URLSearchParams) => void) => { const u = new URLSearchParams(sp.toString()); mut(u); u.delete('page'); router.push(path + (u.toString() ? '?' + u : ''), { scroll: false }); };
  return { sp, push, router, path };
}

export function FilterPanel({ brands }: { brands: string[] }) {
  const { sp, push, path } = useParams();
  const set = (k: string, v: string) => push(u => { v ? u.set(k, v) : u.delete(k); });
  const Radio = ({ k, v, label }: { k: string; v: string; label: string }) => (
    <label><input type="radio" name={k} checked={(sp.get(k) || '') === v} onChange={() => set(k, v)} />{label}</label>);
  const chosen = sp.getAll('brand');
  const toggleBrand = (b: string) => push(u => { const all = u.getAll('brand'); u.delete('brand'); (all.includes(b) ? all.filter(x => x !== b) : [...all, b]).forEach(x => u.append('brand', x)); });
  return (
    <div className="fp">
      <h4>Price</h4><Radio k="maxPrice" v="" label="Any price" /><Radio k="maxPrice" v="999" label="Under ₹999" /><Radio k="maxPrice" v="1999" label="Under ₹1,999" /><Radio k="maxPrice" v="3999" label="Under ₹3,999" />
      <h4>Customer rating</h4><Radio k="rating" v="" label="All" /><Radio k="rating" v="4" label="4★ & above" /><Radio k="rating" v="3" label="3★ & above" />
      <h4>Discount</h4><Radio k="discount" v="" label="All" /><Radio k="discount" v="30" label="30% or more" /><Radio k="discount" v="50" label="50% or more" /><Radio k="discount" v="60" label="60% or more" />
      <h4>Brand</h4>{brands.map(b => <label key={b}><input type="checkbox" checked={chosen.includes(b)} onChange={() => toggleBrand(b)} />{b}</label>)}
      <button className="clr" onClick={() => (location.href = path + (sp.get('q') ? '?q=' + encodeURIComponent(sp.get('q')!) : ''))}>Clear all</button>
    </div>
  );
}

export function SortSelect() {
  const { sp, push } = useParams();
  return <select aria-label="Sort" value={sp.get('sort') || 'rec'} onChange={e => push(u => u.set('sort', e.target.value))}>{SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>;
}

export function MobileBar({ brands }: { brands: string[] }) {
  const { openSheet, closeSheet } = useStore(); const { sp, push } = useParams();
  const active = ['maxPrice', 'rating', 'discount'].filter(k => sp.get(k)).length + sp.getAll('brand').length;
  return (
    <div className="fbar">
      <button onClick={() => openSheet(<><h3>Sort by</h3>{SORTS.map(([k, l]) => <button key={k} className={'opt' + ((sp.get('sort') || 'rec') === k ? ' on' : '')} onClick={() => { push(u => u.set('sort', k)); closeSheet(); }}>{l}</button>)}</>)}>
        <svg className="i" viewBox="0 0 24 24"><path d="M7 4v16M3 16l4 4 4-4M17 20V4m-4 4 4-4 4 4" /></svg>Sort</button>
      <button onClick={() => openSheet(<><h3>Filters</h3><FilterPanel brands={brands} /><button className="btn block" style={{ marginTop: 16 }} onClick={closeSheet}>Show results</button></>)}>
        <svg className="i" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>Filters{active ? ` (${active})` : ''}</button>
    </div>
  );
}

export function QuickChips() {
  const { sp, push } = useParams();
  const chips: [string, string, string][] = [['maxPrice', '999', 'Under ₹999'], ['rating', '4.3', 'Top rated 4.3+'], ['discount', '60', '60%+ off']];
  return <div className="fchips" style={{ marginTop: 8 }}>{chips.map(([k, v, l]) => <button key={k} className={'fc' + (sp.get(k) === v ? ' on' : '')} onClick={() => push(u => (u.get(k) === v ? u.delete(k) : u.set(k, v)))}>{l}</button>)}</div>;
}
