'use client';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { disc, inr, grad, swatches, sizesFor } from '@/lib/util';
import { useStore } from './Store';
import Pic from './Pic';

const Heart = () => <svg className="i" viewBox="0 0 24 24" style={{ width: 19, height: 19 }}><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" /></svg>;

export default function ProductCard({ p }: { p: Product }) {
  const { wish, toggleWish, addToCart, openSheet, closeSheet } = useStore();
  const quick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    openSheet(<>
      <h3>Select size</h3><p style={{ color: 'var(--mute)', margin: '-6px 0 12px' }}>{p.brand} · {p.name}</p>
      <div className="sizes">{sizesFor(p).slice(0, 5).map(s => <button key={s} className="sz" onClick={() => { addToCart(p.id, s); closeSheet(); }}>{s}</button>)}</div>
    </>);
  };
  const sw = swatches(p);
  return (
    <Link href={`/product/${p.id}`} className="card" style={{ display: 'flex' }}>
      <div className="ph" style={{ background: grad(p.id) }}>
        <Pic k={p.image} alt={p.name} />
        {p.tag && <span className="tag">{p.tag}</span>}
        <button className={'heart' + (wish.includes(p.id) ? ' on' : '')} aria-label="Wishlist" onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWish(p.id); }}><Heart /></button>
        <button className="qa" aria-label="Quick add" onClick={quick}>+ Quick add</button>
        <span className="rate">{p.rating} <span style={{ fontWeight: 500, color: 'var(--mute)' }}>| {p.ratings > 999 ? (p.ratings / 1000).toFixed(1) + 'k' : p.ratings}</span></span>
      </div>
      <div className="t">
        <div className="br">{p.brand}</div><div className="nm">{p.name}</div>
        <div className="price"><b>{inr(p.price)}</b><s>{inr(p.mrp)}</s><em>{disc(p)}% off</em></div>
        <div className="sw">{sw.map(c => <i key={c} style={{ background: c }} />)}<small>+{2 + (p.id % 4)} colours</small></div>
        <div className="meta">{p.price >= 799 && <span className="fd">Free delivery</span>}{p.stock < 10 && <span className="lf">Only {p.stock} left</span>}</div>
        {disc(p) > 55 && <div className="best">Best price {inr(Math.round(p.price * 0.93))} with offers</div>}
      </div>
    </Link>
  );
}
