'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/data';
import { api, deliveryDate, disc, grad, inr, sizesFor, swatches } from '@/lib/util';
import { useStore } from './Store';
import { track, toItem } from '@/lib/track';
import Pic from './Pic';

const pos = ['center', '20% 40%', '80% 60%', 'center 85%'];
export function Gallery({ p }: { p: Product }) {
  const [i, setI] = useState(0); const [zoom, setZoom] = useState(false); const [lb, setLb] = useState(false); const [n, setN] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const keys = [p.image, p.image, p.image, 'store'];
  const Im = ({ k, n }: { k: string; n: number }) => <Pic k={k} w={900} style={{ objectPosition: pos[n], transform: n > 0 && n < 3 ? 'scale(1.35)' : undefined }} />;
  return (
    <div>
      <div className="gal" ref={ref} onScroll={e => setN(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth) + 1)}>
        {keys.map((k, n) => <div key={n} style={{ background: grad(p.id) }}><Im k={k} n={n} /></div>)}<span className="gcount">{n} / 4</span>
      </div>
      <div className="gdesk">
        <div className="thumbs">{keys.map((k, n) => <button key={n} className={n === i ? 'on' : ''} onClick={() => setI(n)}><Im k={k} n={n} /></button>)}</div>
        <div className={'zoom' + (zoom ? ' z' : '')} style={{ background: grad(p.id) }}
          onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setZoom(true); const im = e.currentTarget.querySelector('img'); if (im) im.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; }}
          onMouseLeave={() => setZoom(false)} onClick={() => setLb(true)}>
          <Im k={keys[i]} n={i} />
        </div>
      </div>
      <div className={'lb' + (lb ? ' on' : '')} onClick={() => setLb(false)}>{lb && <Pic k={keys[i]} w={1600} />}</div>
    </div>
  );
}

export function Buy({ p }: { p: Product }) {
  const { addToCart, toggleWish, wish, toast, openSheet } = useStore(); const router = useRouter();
  const [size, setSize] = useState<string | null>(null); const [colour, setColour] = useState(0);
  const [pin, setPin] = useState('201309'); const [pinMsg, setPinMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [mini, setMini] = useState(false); const sizeRef = useRef<HTMLDivElement>(null);
  const sizes = sizesFor(p); const sw = swatches(p);
  useEffect(() => { try { setPin(localStorage.getItem('qb_pin') || '201309'); } catch {} const f = () => setMini(scrollY > 760); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  useEffect(() => { track('view_item', { value: p.price, items: [toItem(p)] }); }, [p.id]); // eslint-disable-line
  useEffect(() => { try { const r = JSON.parse(localStorage.getItem('qb_rv') || '[]'); localStorage.setItem('qb_rv', JSON.stringify([p.id, ...r.filter((x: number) => x !== p.id)].slice(0, 8))); } catch {} }, [p.id]);

  const need = () => { if (!size) { toast('Pick a size first'); sizeRef.current?.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 250, iterations: 2 }); return false; } return true; };
  const add = async () => { if (need()) await addToCart(p.id, size!); };
  const buy = async () => { if (need()) { await addToCart(p.id, size!); router.push('/checkout'); } };
  const check = async () => { const r = await api('/api/pincode/' + pin); if (r.serviceable) { try { localStorage.setItem('qb_pin', pin); } catch {} } setPinMsg({ ok: r.serviceable, t: r.serviceable ? `Delivery by ${deliveryDate(4)} · Free · Cash on delivery available` : r.message }); };
  const guide = () => openSheet(<SizeGuide p={p} />);
  const d = (n: number) => new Date(Date.now() + n * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const views = 120 + (p.ratings % 300), sold = 18 + (p.ratings % 60);

  return (
    <>
      <div className="mini" style={mini ? { transform: 'none' } : undefined}><div className="wrap"><span className="th"><Pic k={p.image} w={100} /></span><div><b>{p.brand}</b><div style={{ color: 'var(--mute)', fontSize: 13 }}>{p.name}</div></div><b className="disp" style={{ marginLeft: 20, fontSize: 20 }}>{inr(p.price)}</b><button className="btn" onClick={() => { add(); scrollTo({ top: 0, behavior: 'smooth' }); }}>Add to bag</button></div></div>
      <div className="info">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div><span className="kick" style={{ margin: 0 }}>{p.brand}</span><h1>{p.name}</h1></div>
          <button className={'ib heart' + (wish.includes(p.id) ? ' on' : '')} style={{ flex: 'none', background: 'var(--bg)' }} aria-label="Wishlist" onClick={() => toggleWish(p.id)}>
            <svg className="i" viewBox="0 0 24 24" style={{ width: 19, height: 19 }}><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" /></svg></button>
        </div>
        <div style={{ margin: '10px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><span className="rate" style={{ position: 'static', display: 'inline-flex', background: 'var(--bg)' }}>{p.rating} <span style={{ fontWeight: 500, color: 'var(--mute)' }}>| {p.ratings} ratings</span></span>{p.tag && <span className="st2">{p.tag}</span>}</div>
        <div className="price" style={{ margin: 0 }}><b className="disp" style={{ fontSize: 32 }}>{inr(p.price)}</b><s style={{ fontSize: 15 }}>{inr(p.mrp)}</s><em style={{ fontSize: 15 }}>{disc(p)}% off</em></div>
        <div style={{ color: 'var(--good)', fontSize: 12.5, fontWeight: 600 }}>Inclusive of all taxes · You save {inr(p.mrp - p.price)}</div>
        <div className="proof"><span><i />{views} people viewed today</span><span>{sold} bought this week</span></div>
        <div className="emi"><span style={{ fontSize: 20 }}>💳</span><span><b>EMI from {inr(Math.round(p.price / 6))}/month</b><br /><span style={{ color: 'var(--mute)' }}>No-cost EMI on HDFC, ICICI and Axis cards</span></span></div>
        <b style={{ display: 'block', marginTop: 20 }}>Colour</b>
        <div className="cols2">{sw.map((c, i) => <button key={c} className={'cdot' + (i === colour ? ' on' : '')} style={{ background: c }} aria-label={'Colour ' + (i + 1)} onClick={() => setColour(i)} />)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}><b>Select size</b><button className="lk" onClick={guide}>Size guide & finder</button></div>
        <div className="sizes" ref={sizeRef}>{sizes.map((s, i) => <button key={s} className={'sz' + (size === s ? ' on' : '') + (i === 5 ? ' x' : '')} disabled={i === 5} onClick={() => setSize(s)}>{s}</button>)}</div>
        <div className="fit"><div className="lb2"><span>Runs small</span><b style={{ color: 'var(--ink)' }}>True to size</b><span>Runs large</span></div><div className="tr"><i /></div><div style={{ fontSize: 12, color: 'var(--mute)' }}>82% of buyers say it fits true to size</div></div>
        <div className="btnrow"><button className="btn line" onClick={add}>Add to bag</button><button className="btn" onClick={buy}>Buy now</button></div>
        <div className="pn offs" style={{ background: 'var(--bg)', marginTop: 16 }}><h3>Best offers</h3><ul><li><span><b>10% instant discount</b> on HDFC credit cards & EMI, up to ₹1,500</span></li><li><span><b>Extra ₹100 off</b> on your first order with FIRST100</span></li><li><span><b>Free delivery</b> on this order</span></li></ul></div>
        <div style={{ marginTop: 16 }}><b>Delivery</b>
          <div className="pin"><input value={pin} maxLength={6} inputMode="numeric" onChange={e => setPin(e.target.value)} placeholder="Enter pincode" /><button onClick={check}>Check</button></div>
          <div className="pinr" style={{ color: pinMsg ? (pinMsg.ok ? 'var(--good)' : '#d9480f') : undefined }}>{pinMsg ? pinMsg.t : <>Delivery by <b>{deliveryDate(4)}</b> · Free · Cash on delivery available</>}</div>
          <div className="dtl"><div><i>1</i>Order<small>Today</small></div><div><i>2</i>Shipped<small>{d(1)}</small></div><div><i>3</i>Delivered<small>{d(4)}</small></div></div></div>
        <div className="sticky"><div style={{ flex: 'none', lineHeight: 1.1 }}><b className="disp" style={{ fontSize: 20 }}>{inr(p.price)}</b><div style={{ fontSize: 12, color: 'var(--good)', fontWeight: 700 }}>{disc(p)}% off</div></div><button className="btn line" style={{ flex: 0.8 }} onClick={add}>Add</button><button className="btn" onClick={buy}>Buy now</button></div>
        <p style={{ color: 'var(--mute)', marginTop: 14 }}>Sold by QuickBaazar Retail Pvt Ltd · 14-day returns</p>
      </div>
    </>
  );
}

function SizeGuide({ p }: { p: Product }) {
  const f = p.category === 'footwear'; const [h, setH] = useState(''); const [w, setW] = useState(''); const [rec, setRec] = useState('');
  const find = () => { const H = +h, W = +w; if (!H || !W) { setRec('Enter your height and weight'); return; } const bmi = W / ((H / 100) ** 2); setRec(f ? (H < 165 ? '7' : H < 172 ? '8' : H < 179 ? '9' : '10') : bmi < 20 ? 'S' : bmi < 23 ? 'M' : bmi < 26 ? 'L' : bmi < 29 ? 'XL' : 'XXL'); };
  const rows = f ? [[6, 24.5, 6], [7, 25.4, 7], [8, 26.2, 8], [9, 27, 9], [10, 27.9, 10]] : [['S', 36, 30], ['M', 38, 32], ['L', 40, 34], ['XL', 42, 36], ['XXL', 44, 38]];
  return <><h3>Size guide</h3>
    <table className="sgt"><thead><tr><th>Size</th><th>{f ? 'Foot length (cm)' : 'Chest (in)'}</th><th>{f ? 'UK' : 'Waist (in)'}</th></tr></thead><tbody>{rows.map(r => <tr key={r[0]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>
    <h3 style={{ marginTop: 16 }}>Find my size</h3>
    <div className="two"><div className="fld"><label>Height (cm)</label><input value={h} onChange={e => setH(e.target.value)} type="number" placeholder="172" /></div><div className="fld"><label>Weight (kg)</label><input value={w} onChange={e => setW(e.target.value)} type="number" placeholder="68" /></div></div>
    <button className="btn block" onClick={find}>Recommend a size</button>
    {rec && <p style={{ marginTop: 12, fontWeight: 700, textAlign: 'center' }}>{rec.length > 3 ? rec : <>We recommend <span style={{ color: 'var(--coral)', fontSize: 22 }}>{rec}</span></>}</p>}</>;
}

export function Bundle({ items }: { items: Product[] }) {
  const { addToCart } = useStore(); const [on, setOn] = useState<number[]>(items.map(x => x.id));
  const total = items.filter(x => on.includes(x.id)).reduce((a, x) => a + x.price, 0);
  return (
    <div className="pn"><div className="bund">{items.map((x, i) => (
      <span key={x.id} style={{ display: 'contents' }}>{i > 0 && <span className="pl">+</span>}
        <label className="it"><input type="checkbox" checked={on.includes(x.id)} onChange={() => setOn(o => (o.includes(x.id) ? o.filter(y => y !== x.id) : [...o, x.id]))} /><div className="th"><Pic k={x.image} w={300} /></div>{x.brand}<br />{inr(x.price)}</label></span>))}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
        <span><b className="disp" style={{ fontSize: 22 }}>{inr(total)}</b> for {on.length} items</span>
        <button className="btn" disabled={!on.length} onClick={async () => { for (const id of on) { const x = items.find(y => y.id === id)!; await addToCart(id, sizesFor(x)[x.category === 'footwear' ? 2 : 2]); } }}>Add all to bag</button></div></div>
  );
}

export function Helpful({ n }: { n: number }) {
  const [on, setOn] = useState(false);
  return <button className={'help' + (on ? ' on' : '')} onClick={() => setOn(!on)}>👍 Helpful ({n + (on ? 1 : 0)})</button>;
}
