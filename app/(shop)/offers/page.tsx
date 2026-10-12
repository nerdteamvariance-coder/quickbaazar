import { liveCoupons } from '@/lib/db';
import { activeProducts } from '@/lib/store';
import { disc } from '@/lib/util';
import { PageHead } from '@/components/Empty';
import CopyCode from '@/components/CopyCode';
import ProductCard from '@/components/ProductCard';

export const metadata = { title: 'Offers & coupons' };
export const dynamic = 'force-dynamic';
export default function Offers() {
  return (
    <div className="view"><PageHead title="Offers & coupons" sub="Tap a code to copy it, then paste it at checkout." crumb="Offers" />
      <div className="pg c2">{liveCoupons().map(c => <div className="cp" key={c.code}><div><code>{c.code}</code><b style={{ display: 'block', marginTop: 2 }}>{c.title}</b><small>{c.note}</small></div><CopyCode code={c.code} /></div>)}</div>
      <div className="sh" style={{ marginTop: 26 }}><h2>Biggest drops today</h2></div>
      <div className="grid">{[...activeProducts()].sort((a, b) => disc(b) - disc(a)).slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
