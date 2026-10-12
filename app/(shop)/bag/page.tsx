'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/Store';
import Pic from '@/components/Pic';
import { Empty } from '@/components/Empty';
import { deliveryDate, disc, grad, inr } from '@/lib/util';

export default function Bag() {
  const { cart, ready, setQty, applyCoupon, removeCoupon, toggleWish, wish } = useStore(); const router = useRouter();
  const [code, setCode] = useState('');
  if (!ready) return <div className="view" style={{ padding: 60, textAlign: 'center', color: 'var(--mute)' }}>Loading your bag…</div>;
  if (!cart.items.length) return <Empty title="Your bag is empty" text="Items you add show up here, ready for checkout." cta="Start shopping" href="/shop/all" />;
  const pct = Math.min(100, (cart.subtotal / 799) * 100);
  return (
    <div className="view">
      <div className="ptitle"><h1>Bag<small>{cart.items.length} items</small></h1></div>
      <div className="bagwrap">
        <div>
          <div className="prog">{cart.freeShipLeft ? <>Add <b>{inr(cart.freeShipLeft)}</b> more for <span style={{ color: 'var(--good)' }}>free delivery</span></> : <span style={{ color: 'var(--good)' }}>You’ve unlocked free delivery</span>}<div className="bar"><i style={{ width: pct + '%' }} /></div></div>
          <div className="save"><span style={{ fontSize: 22 }}>🎉</span><span>You’re saving <b style={{ color: 'var(--good)' }}>{inr(cart.discount + cart.couponOff)}</b> on this order</span></div>
          {cart.items.map((r, i) => (
            <div className="item" key={r.id + '-' + r.productId + r.size}>
              <Link className="th" href={`/product/${r.productId}`} style={{ background: grad(r.productId) }}><Pic k={r.product.image} w={300} /></Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, paddingRight: 26 }}>{r.product.brand}</div>
                <div style={{ color: 'var(--mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.product.name}</div>
                <div className="sel"><button>Size: {r.size}</button><div className="qty"><button aria-label="Less" onClick={() => setQty(i, r.qty - 1)}>−</button><span>{r.qty}</span><button aria-label="More" onClick={() => setQty(i, r.qty + 1)}>+</button></div></div>
                <div className="price" style={{ margin: 0 }}><b>{inr(r.product.price)}</b><s>{inr(r.product.mrp)}</s><em>{disc(r.product) }% off</em></div>
                <div style={{ fontSize: 12.5, marginTop: 6, color: 'var(--mute)' }}>↩ 14 days return · Delivery by {deliveryDate(5)}</div>
                <button className="lk" style={{ marginTop: 8 }} onClick={async () => { if (!wish.includes(r.productId)) await toggleWish(r.productId); await setQty(i, 0); }}>Move to wishlist</button>
              </div>
              <button className="x" aria-label="Remove" onClick={() => setQty(i, 0)}>✕</button>
            </div>
          ))}
        </div>
        <div>
          <div className="sum"><h3 className="disp" style={{ marginBottom: 6 }}>Coupons</h3>
            {cart.coupon ? <div className="cp" style={{ padding: '10px 12px', borderLeftWidth: 4 }}><div><code style={{ fontSize: 16 }}>{cart.coupon}</code><small>Applied</small></div><button onClick={removeCoupon}>Remove</button></div>
              : <><div className="cpn"><input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code (try QUICK10)" /><button onClick={() => applyCoupon(code)}>Apply</button></div><Link className="lk" href="/offers" style={{ display: 'inline-block', marginTop: 8 }}>View all offers</Link></>}</div>
          <div className="sum"><h3 className="disp" style={{ marginBottom: 8 }}>Price details</h3>
            <div className="r"><span>Total MRP</span><span>{inr(cart.mrp)}</span></div>
            <div className="r"><span>Discount</span><span className="g">−{inr(cart.discount)}</span></div>
            {cart.couponOff > 0 && <div className="r"><span>Coupon ({cart.coupon})</span><span className="g">−{inr(cart.couponOff)}</span></div>}
            <div className="r"><span>Delivery</span><span className={cart.shipping ? '' : 'g'}>{cart.shipping ? inr(cart.shipping) : 'Free'}</span></div>
            <div className="r t"><span>Total</span><span>{inr(cart.total)}</span></div></div>
          <div className="trust">Secure payments · 14-day returns</div>
          <div className="pay"><span>UPI</span><span>Cards</span><span>NetBanking</span><span>Cash on delivery</span></div>
          <button className="btn block" onClick={() => router.push('/checkout')}>Place order · {inr(cart.total)}</button>
          <p style={{ textAlign: 'center', color: 'var(--mute)', fontSize: 12.5, marginTop: 8 }}>No account needed — checkout as guest</p>
        </div>
      </div>
    </div>
  );
}
