import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getReviews, relatedProducts } from '@/lib/db';
import { activeProducts } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import { Gallery, Buy, Bundle, Helpful } from '@/components/ProductClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const p = getProduct(+id); return { title: p ? `${p.brand} ${p.name}` : 'Product' }; }

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const p = getProduct(+id); if (!p) notFound();
  const rel = relatedProducts(p.id), bundle = [p, ...rel.slice(0, 2)];
  const look = activeProducts().filter(x => x.id !== p.id && x.category !== p.category && (x.gender === p.gender || x.gender === 'women')).slice(0, 6);
  const reviews = getReviews(p.id);
  const raw = [5, 4, 3, 2, 1].map(s => Math.exp(-Math.abs(s - p.rating) * 1.3)), sum = raw.reduce((a, b) => a + b, 0), dist = raw.map(x => Math.round((x / sum) * 100));
  const SV = (d: string) => <svg className="i" viewBox="0 0 24 24"><path d={d} /></svg>;
  return (
    <div className="view pdp">
      <Gallery p={p} />
      <div><div className="crumb" style={{ padding: '0 0 8px' }}><Link href="/">Home</Link> / <Link href={`/shop/${p.category}`}>{p.category}</Link> / {p.brand}</div><Buy p={p} /></div>

      <div className="full" style={{ marginTop: 24 }}>
        <div className="sh"><div><span className="kick">Why you’ll love it</span><h2>Made to last</h2></div></div>
        <div className="hl">
          <div>{SV('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4')}<span><b>100% authentic</b>Sourced from the brand</span></div>
          <div>{SV('M3 12a9 9 0 1 0 3-6.7M3 4v4h4')}<span><b>14-day returns</b>Free pickup from home</span></div>
          <div>{SV('M5 12l5 5L20 7')}<span><b>Quality checked</b>Inspected before dispatch</span></div>
          <div>{SV('M3 6h18v12H3z')}<span><b>Pay your way</b>UPI, cards, COD</span></div>
        </div>
      </div>
      <div className="full" style={{ marginTop: 14 }}>
        <details className="faq" open><summary>Product details</summary><p>{p.name} from {p.brand}. Designed for everyday wear with a comfortable fit and durable build. Machine wash or wipe clean as indicated on the care label.</p></details>
        <details className="faq"><summary>Specifications</summary><div style={{ padding: '0 16px 12px' }}><table className="spec"><tbody><tr><td>Brand</td><td>{p.brand}</td></tr><tr><td>Category</td><td>{p.category}</td></tr><tr><td>Fit</td><td>Regular</td></tr><tr><td>Material</td><td>{p.category === 'footwear' ? 'Mesh & synthetic' : 'Cotton blend'}</td></tr><tr><td>Country of origin</td><td>India</td></tr></tbody></table></div></details>
        <details className="faq"><summary>Returns & exchange</summary><p>Return or exchange within 14 days of delivery. Free pickup from your door. Refund within 48 hours of pickup.</p></details>
      </div>
      {bundle.length > 1 && <div className="full" style={{ marginTop: 24 }}><div className="sh"><div><span className="kick">Save more</span><h2>Frequently bought together</h2></div></div><Bundle items={bundle} /></div>}
      {look.length > 0 && <div className="full" style={{ marginTop: 24 }}><div className="sh"><div><span className="kick">Style it</span><h2>Complete the look</h2></div></div><div className="hs">{look.map(x => <ProductCard key={x.id} p={x} />)}</div></div>}
      <div className="full" style={{ marginTop: 24 }}>
        <div className="sh"><div><span className="kick">{p.ratings} verified ratings</span><h2>Ratings & reviews</h2></div></div>
        <div className="pn"><div className="rate-big"><div><b>{p.rating}<span style={{ fontSize: 22, color: 'var(--good)' }}> ★</span></b><div style={{ color: 'var(--mute)', fontSize: 13 }}>{p.ratings} ratings</div></div>
          <div className="dist">{dist.map((x, i) => <div key={i}><span>{5 - i}★</span><div className="bar"><i style={{ width: x + '%' }} /></div><span style={{ width: 34, textAlign: 'right' }}>{x}%</span></div>)}</div></div>
          {reviews.map(r => <div key={r.id} style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 12 }}><div style={{ color: 'var(--gold)', letterSpacing: 2 }}>{'★'.repeat(r.rating)}</div><p style={{ margin: '4px 0' }}>{r.text}</p><small style={{ color: 'var(--mute)' }}><b style={{ color: 'var(--ink)' }}>{r.name}</b> · Verified buyer · {r.date}</small><br /><Helpful n={r.helpful} /></div>)}</div>
      </div>
      {rel.length > 0 && <div className="full" style={{ marginTop: 24 }}><div className="sh"><div><span className="kick">Keep browsing</span><h2>You may also like</h2></div></div><div className="hs">{rel.map(x => <ProductCard key={x.id} p={x} />)}</div></div>}
    </div>
  );
}
