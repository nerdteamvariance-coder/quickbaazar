import Link from 'next/link';
import { listProducts } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { FilterPanel, SortSelect, MobileBar, QuickChips } from '@/components/ShopFilters';

type SP = Record<string, string | string[] | undefined>;
export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) { const { cat } = await params; return { title: cat === 'all' ? 'All products' : cat[0].toUpperCase() + cat.slice(1) }; }

export default async function Shop({ params, searchParams }: { params: Promise<{ cat: string }>; searchParams: Promise<SP> }) {
  const { cat } = await params; const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const num = (k: string) => (one(k) ? Number(one(k)) : undefined);
  const brand = ([] as string[]).concat((sp.brand as any) || []);
  const q = one('q');
  const all = listProducts({ category: cat, q });                   // for the brand list
  const r = listProducts({ category: cat, q, sort: one('sort'), maxPrice: num('maxPrice'), rating: num('rating'), discount: num('discount'), brand, page: num('page'), limit: 24 });
  const title = q ? `“${q}”` : cat === 'all' ? 'All products' : cat[0].toUpperCase() + cat.slice(1);
  return (
    <div className="view">
      <div className="crumb"><Link href="/">Home</Link> / {title}</div>
      <div className="rc"><div className="ptitle" style={{ padding: 0 }}><h1>{title}<small>{r.total} items</small></h1></div><SortSelect /></div>
      <QuickChips />
      <div className="lw">
        <aside className="side"><FilterPanel brands={all.brands} /></aside>
        <div>
          {r.items.length ? <div className="grid">{r.items.map(p => <ProductCard key={p.id} p={p} />)}</div> : (
            <div className="empty"><div className="o"><svg className="i" viewBox="0 0 24 24"><path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5" /></svg></div><h2>Nothing matches</h2><p>Clear a filter or try another keyword.</p><Link className="btn" href={`/shop/${cat}`}>Clear filters</Link></div>)}
        </div>
      </div>
      <MobileBar brands={all.brands} />
    </div>
  );
}
