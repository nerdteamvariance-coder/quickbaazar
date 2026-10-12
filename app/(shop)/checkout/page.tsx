'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/Store';
import { Empty } from '@/components/Empty';
import { api, inr } from '@/lib/util';
import { track, toItem } from '@/lib/track';

export default function Checkout() {
  const { cart, ready, refreshCart, toast } = useStore(); const router = useRouter();
  const [f, setF] = useState({ name: '', phone: '', email: '', line1: '', pin: '201309', city: '' });
  const [pay, setPay] = useState('upi'); const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { // GA4 begin_checkout, once
    if (ready && cart.items.length && !started.current) { started.current = true; track('begin_checkout', { value: cart.total, items: cart.items.map(i => toItem(i.product, i.qty, i.size)) }); }
  }, [ready, cart]);
  useEffect(() => { // remember contact details so an abandoned checkout can be followed up
    const phone = f.phone.replace(/\D/g, '');
    if (!cart.items.length || !(phone.length >= 10 || /.+@.+\..+/.test(f.email))) return;
    const t = setTimeout(() => api('/api/checkout/capture', { method: 'POST', body: JSON.stringify({ name: f.name, phone, email: f.email }) }).catch(() => {}), 900);
    return () => clearTimeout(t);
  }, [f.name, f.phone, f.email, cart.items.length]);

  if (!ready) return <div className="view" style={{ padding: 60, textAlign: 'center', color: 'var(--mute)' }}>Loading…</div>;
  if (!cart.items.length) return <Empty title="Nothing to check out" text="Add something to your bag first." cta="Start shopping" href="/shop/all" />;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const snap = cart;
    try {
      const o = await api('/api/orders', { method: 'POST', body: JSON.stringify({ address: f, payment: pay }) });
      track('purchase', { transaction_id: o.id, value: o.total, shipping: snap.shipping, coupon: snap.coupon || undefined, payment_type: pay, items: snap.items.map(i => toItem(i.product, i.qty, i.size)) });
      await refreshCart(); router.push('/success/' + o.id);
    } catch (er: any) { toast(er.message); setBusy(false); }
  };
  const Fld = ({ l, k, ph, type = 'text', req = true }: { l: string; k: keyof typeof f; ph: string; type?: string; req?: boolean }) => <div className="fld"><label>{l}</label><input type={type} required={req} value={f[k]} onChange={set(k)} placeholder={ph} /></div>;
  return (
    <div className="view">
      <div className="ptitle"><h1>Checkout</h1></div>
      <div className="stepper"><span className="on">1 · Bag</span><span className="on">2 · Address & payment</span><span>3 · Done</span></div>
      <div className="ckwrap">
        <form id="ck" onSubmit={submit}>
          <div className="pn" style={{ marginBottom: 14 }}><h3>Delivery address</h3>
            <div className="two"><Fld l="Full name" k="name" ph="Harish" /><Fld l="Mobile" k="phone" ph="10-digit number" type="tel" /></div>
            <Fld l="Email (for order updates)" k="email" ph="you@email.com" type="email" req={false} />
            <Fld l="Address" k="line1" ph="House no, building, street" />
            <div className="two"><Fld l="Pin code" k="pin" ph="201309" /><Fld l="City" k="city" ph="Noida" /></div></div>
          <div className="pn" style={{ marginBottom: 14 }}><h3>Payment</h3>
            {[['upi', 'UPI', 'Google Pay, PhonePe, Paytm'], ['card', 'Credit / debit card', '10% instant discount on HDFC'], ['netbanking', 'Net banking', ''], ['cod', 'Cash on delivery', 'Pay when it arrives']].map(([v, l, s]) => (
              <label className="rad" key={v}><input type="radio" name="pm" checked={pay === v} onChange={() => setPay(v)} /><span>{l}{s && <small>{s}</small>}</span></label>))}</div>
        </form>
        <div className="sum" style={{ marginTop: 0 }}><h3 className="disp" style={{ marginBottom: 8 }}>Order summary</h3>
          {cart.items.map(r => <div className="r" key={r.id}><span>{r.product.brand} × {r.qty}</span><span>{inr(r.product.price * r.qty)}</span></div>)}
          <div className="r"><span>Discount</span><span className="g">−{inr(cart.discount)}</span></div>
          {cart.couponOff > 0 && <div className="r"><span>Coupon ({cart.coupon})</span><span className="g">−{inr(cart.couponOff)}</span></div>}
          <div className="r"><span>Delivery</span><span className={cart.shipping ? '' : 'g'}>{cart.shipping ? inr(cart.shipping) : 'Free'}</span></div>
          <div className="r t"><span>To pay</span><span>{inr(cart.total)}</span></div>
          <button className="btn block" form="ck" style={{ marginTop: 12 }} disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
          <div className="trust">Secure payments · 14-day returns</div></div>
      </div>
    </div>
  );
}
