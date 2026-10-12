'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHead } from '@/components/Empty';
import { api, deliveryDate } from '@/lib/util';

function Track() {
  const sp = useSearchParams(); const [id, setId] = useState(sp.get('orderId') || 'QB-10482'); const [res, setRes] = useState<any>(null); const [err, setErr] = useState('');
  const run = async (v = id) => { try { setErr(''); setRes(await api('/api/track?orderId=' + encodeURIComponent(v))); } catch (e: any) { setErr(e.message); } };
  useEffect(() => { if (sp.get('orderId')) run(sp.get('orderId')!); }, []); // eslint-disable-line
  return (
    <div className="view"><PageHead title="Track your order" sub="Enter your order ID and the phone number used at checkout." crumb="Track order" />
      <div className="pg c2">
        <form className="pn" onSubmit={e => { e.preventDefault(); run(); }}>
          <div className="fld"><label>Order ID</label><input required value={id} onChange={e => setId(e.target.value)} placeholder="QB-10482" /></div>
          <div className="fld"><label>Phone number</label><input required type="tel" placeholder="98765 43210" /></div>
          <button className="btn block">Track</button></form>
        <div className="pn"><h3>{res ? res.orderId : 'Status'}</h3>
          {err && <p style={{ color: '#d9480f' }}>{err}</p>}
          {!res && !err && <p>Your order timeline will show here.</p>}
          {res && <><p style={{ marginBottom: 10 }}>Arriving by <b style={{ color: 'var(--ink)' }}>{deliveryDate(4)}</b></p><ul className="tl">{res.stages.map((s: any) => <li key={s.label} className={s.done ? 'd' : ''}>{s.label}</li>)}</ul></>}</div>
      </div></div>
  );
}
export default function Page() { return <Suspense><Track /></Suspense>; }
