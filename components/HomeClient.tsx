'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { grad, inr } from '@/lib/util';
import Pic from './Pic';

type Slide = { image: string; chip: string; h: string; t: string; href: string };
export function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0); const x0 = useRef<number | null>(null); const timer = useRef<any>(undefined);
  const go = useCallback((d: number) => setI(v => (v + d + slides.length) % slides.length), [slides.length]);
  useEffect(() => { timer.current = setInterval(() => go(1), 4500); return () => clearInterval(timer.current); }, [i, go]);
  const s = slides[i];
  return (
    <>
      <section className="hero" onPointerDown={e => (x0.current = e.clientX)} onPointerUp={e => { if (x0.current === null) return; const dx = e.clientX - x0.current; x0.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
        <div className="bg" key={'b' + i} style={{ background: grad(i + 1) }}><Pic k={s.image} w={1400} /></div>
        <div className="in" key={'t' + i}>
          <span className="chip"><i className="live" /> {s.chip}</span>
          <h1 dangerouslySetInnerHTML={{ __html: s.h }} /><p>{s.t}</p>
          <div className="cta"><Link className="btn" href={s.href}>Shop now</Link><Link className="btn ghost" href="/shop/all">Explore all</Link></div>
        </div>
      </section>
      <div className="dots">{slides.map((_, n) => <i key={n} className={n === i ? 'on' : ''} onClick={() => setI(n)} />)}</div>
    </>
  );
}

type Story = { name: string; image: string; slides: { image: string; title: string; href: string; cta: string }[] };
export function Stories({ stories }: { stories: Story[] }) {
  const [at, setAt] = useState<[number, number] | null>(null);
  const t = useRef<any>(undefined);
  const step = useCallback((d: number) => setAt(a => {
    if (!a) return a; let [g, s] = a; s += d;
    if (s < 0) { g = Math.max(0, g - 1); s = 0; } else if (s >= stories[g].slides.length) { g++; s = 0; if (g >= stories.length) return null; }
    return [g, s];
  }), [stories]);
  useEffect(() => { clearTimeout(t.current); if (at) t.current = setTimeout(() => step(1), 4200); return () => clearTimeout(t.current); }, [at, step]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (!at) return; if (e.key === 'Escape') setAt(null); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [at, step]);
  const g = at && stories[at[0]], s = g && g.slides[at![1]];
  return (
    <>
      <div className="stories">{stories.map((st, n) => (
        <button key={st.name} className="stor" onClick={() => setAt([n, 0])}><div className="rg"><div style={{ background: grad(n) }}><Pic k={st.image} w={200} /></div></div>{st.name}</button>))}</div>
      {g && s && (
        <div className="story on" role="dialog" aria-modal="true">
          <div className="sc" key={at![0] + '-' + at![1]}>
            <div style={{ position: 'absolute', inset: 0, background: grad(at![0] + at![1]) }}><Pic k={s.image} w={900} /></div>
            <div className="pb">{g.slides.map((_, n) => <i key={n} className={n < at![1] ? 'd' : n === at![1] ? 'a' : ''}><b /></i>)}</div>
            <div className="hd"><span>{g.name}</span><button aria-label="Close story" onClick={() => setAt(null)}>✕</button></div>
            <div className="nv l" onClick={() => step(-1)} /><div className="nv r" onClick={() => step(1)} />
            <div className="tx"><span className="chip">{g.name}</span><h3 dangerouslySetInnerHTML={{ __html: s.title }} /><Link className="btn" href={s.href} onClick={() => setAt(null)}>{s.cta}</Link></div>
          </div>
        </div>
      )}
    </>
  );
}

export function Countdown({ hours = 3, id }: { hours?: number; id?: string }) {
  const [left, setLeft] = useState('--:--:--');
  useEffect(() => {
    const tick = () => { const d = new Date(), n = new Date(d); n.setHours(Math.ceil((d.getHours() + 1) / hours) * hours, 0, 0, 0); const s = Math.max(0, Math.floor((+n - +d) / 1000)); setLeft([Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map(x => String(x).padStart(2, '0')).join(':')); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [hours]);
  return <span className="tm" id={id}>{left}</span>;
}
export const Money = ({ n }: { n: number }) => <>{inr(n)}</>;
