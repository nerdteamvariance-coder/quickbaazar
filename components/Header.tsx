'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MENU } from '@/lib/data';
import { api, inr } from '@/lib/util';
import { useStore } from './Store';
import { track } from '@/lib/track';
import Pic from './Pic';

const DEFAULT_MSG = ['Free delivery over ₹799', '14-day easy returns', 'Cash on delivery available', '10% off with HDFC cards'];
const I = (d: string) => <svg className="i" viewBox="0 0 24 24"><path d={d} /></svg>;

export default function Header() {
  const { cart, wish } = useStore();
  const router = useRouter(); const path = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false);
  const [sg, setSg] = useState<{ trending: string[]; products: any[] }>({ trending: [], products: [] });
  const [scrolled, setScrolled] = useState(false);
  const [pin, setPin] = useState('201309');
  const [MSG, setMsgs] = useState(DEFAULT_MSG);
  useEffect(() => { api('/api/settings').then(s => s.announcements?.length && setMsgs(s.announcements)).catch(() => {}); }, []);
  const { openSheet, closeSheet, toast } = useStore();
  const timer = useRef<any>(undefined);

  useEffect(() => { setDrawer(false); }, [path]);
  useEffect(() => { const f = () => setScrolled(scrollY > 8); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  useEffect(() => { try { setPin(localStorage.getItem('qb_pin') || '201309'); } catch {} }, []);
  useEffect(() => { clearTimeout(timer.current); timer.current = setTimeout(() => api('/api/search/suggest?q=' + encodeURIComponent(q)).then(setSg).catch(() => {}), 150); }, [q]);

  const go = (v: string) => { track('search', { search_term: v }); setOpen(false); setQ(v); router.push('/shop/all?q=' + encodeURIComponent(v)); };
  const changePin = () => openSheet(<PinForm cur={pin} onDone={(v) => { setPin(v); try { localStorage.setItem('qb_pin', v); } catch {} closeSheet(); toast('Delivering to ' + v); }} />);

  return (
    <>
      <div className="ann"><div className="mq">{[...MSG, ...MSG].map((m, i) => <span key={i}>{m}</span>)}</div></div>
      <header className={'hdr' + (scrolled ? ' scrolled' : '')}>
        <div className="wrap">
          <div className="row">
            <button className="ib mbtn" aria-label="Open menu" onClick={() => setDrawer(true)}>{I('M4 7h16M4 12h16M4 17h10')}</button>
            <Link href="/" className="logo" aria-label="QuickBaazar home"><b>q</b>quickbaazar</Link>
            <nav className="dnav" aria-label="Categories">
              {Object.entries(MENU).map(([n, m]) => (
                <div className="mi" key={n}>
                  <Link href={`/shop/${m.key}`}>{n}</Link>
                  <div className="mega"><div className="wrap">
                    {m.cols.map(c => <div key={c[0]}><h4>{c[0]}</h4><ul>{c[1].map(x => <li key={x}><Link href={`/shop/${m.key}`}>{x}</Link></li>)}</ul></div>)}
                    <Link className="feat" href={`/shop/${m.key}`}><Pic k={m.image} /><b>{m.title}</b><span>Shop now →</span></Link>
                  </div></div>
                </div>
              ))}
              <div className="mi"><Link href="/offers" style={{ color: 'var(--coral)' }}>Offers</Link></div>
            </nav>
            <label className="search">
              {I('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5')}
              <input value={q} placeholder="Search for “sneakers”" autoComplete="off" aria-label="Search"
                onChange={e => setQ(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={e => e.key === 'Enter' && q.trim() && go(q.trim())} />
              <div className={'sg' + (open ? ' on' : '')} onMouseDown={e => e.preventDefault()}>
                {!q && <><h5>Trending searches</h5><div className="tr">{sg.trending.map(t => <button type="button" key={t} onClick={() => go(t)}>{t}</button>)}</div></>}
                {sg.products.length > 0 && <><h5>Products</h5>{sg.products.map(p => (
                  <Link key={p.id} href={`/product/${p.id}`} onClick={() => setOpen(false)}><span className="th"><Pic k={p.image} w={100} /></span><span>{p.brand}<small>{p.name} · {inr(p.price)}</small></span></Link>))}</>}
                {q && <button type="button" onClick={() => go(q.trim())}>Search “{q}” in all products</button>}
              </div>
            </label>
            <div className="icons">
              <Link className="ib" href="/login" aria-label="Account">{I('M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-4 4-6 8-6s7 2 8 6')}</Link>
              <Link className="ib" href="/wishlist" aria-label="Wishlist">{I('M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z')}{wish.length > 0 && <span className="badge">{wish.length}</span>}</Link>
              <Link className="ib" href="/bag" aria-label="Bag">{I('M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2')}{cart.count > 0 && <span className="badge">{cart.count}</span>}</Link>
            </div>
          </div>
          <div className="loc">{I('M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z')}Deliver to <button onClick={changePin}>{pin} ▾</button></div>
        </div>
      </header>

      <div className={'scrim' + (drawer ? ' on' : '')} onClick={() => setDrawer(false)} />
      <aside className={'drawer' + (drawer ? ' on' : '')} aria-label="Menu">
        <div className="dh"><Link href="/" className="logo"><b>q</b>quickbaazar</Link><button className="ib" onClick={() => setDrawer(false)} aria-label="Close">✕</button></div>
        {Object.entries(MENU).map(([n, m]) => <details key={n}><summary>{n}</summary>{m.cols.flatMap(c => c[1]).slice(0, 8).map(x => <Link key={x} href={`/shop/${m.key}`}>{x}</Link>)}</details>)}
        <div className="dl">{[['/offers', 'Offers & coupons'], ['/brands', 'All brands'], ['/orders', 'My orders'], ['/track', 'Track order'], ['/help', 'Help centre'], ['/about', 'About QuickBaazar'], ['/contact', 'Contact us']].map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</div>
        <div className="lg"><Link className="btn" href="/login">Log in</Link><Link className="btn ghost" style={{ border: '1.5px solid var(--line)' }} href="/login">Sign up</Link></div>
      </aside>
    </>
  );
}

function PinForm({ cur, onDone }: { cur: string; onDone: (v: string) => void }) {
  const [v, setV] = useState(cur); const [err, setErr] = useState('');
  const apply = async () => { const r = await api('/api/pincode/' + v); r.serviceable ? onDone(v) : setErr(r.message); };
  return <><h3>Choose delivery pincode</h3><p style={{ color: 'var(--mute)', margin: '-6px 0 12px' }}>We’ll show delivery dates and cash on delivery for this area.</p>
    <div className="pin"><input value={v} maxLength={6} inputMode="numeric" onChange={e => setV(e.target.value)} placeholder="6-digit pincode" /><button onClick={apply}>Apply</button></div>{err && <p style={{ color: '#d9480f', marginTop: 8 }}>{err}</p>}</>;
}
