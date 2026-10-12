'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, inr } from '@/lib/util';
import Pic from '@/components/Pic';
import { Empty } from '@/components/Empty';

export default function Orders() {
  const [orders, setOrders] = useState<any[] | null>(null);
  useEffect(() => { api('/api/orders').then(setOrders); }, []);
  if (orders === null) return <div className="view" style={{ padding: 60, textAlign: 'center', color: 'var(--mute)' }}>Loading…</div>;
  if (!orders.length) return <Empty title="No orders yet" text="Orders you place show up here with live tracking." cta="Start shopping" href="/shop/all" />;
  return (
    <div className="view"><div className="crumb"><Link href="/">Home</Link> / Orders</div><div className="phero"><h1 className="disp">My orders</h1></div>
      {orders.map(o => { const p = o.items[0]; return (
        <div className="ord" key={o.id}><div className="th"><Pic k={p.image} w={200} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><b>{p.brand}{o.items.length > 1 ? ` + ${o.items.length - 1} more` : ''}</b>
            <div style={{ color: 'var(--mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
            <div style={{ margin: '6px 0' }}><span className={'st2' + (o.status === 'Delivered' ? '' : ' o')}>{o.status}</span> <small style={{ color: 'var(--mute)' }}>{o.id} · {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
            <Link href={`/track?orderId=${o.id}`} className="lk">Track</Link> · <Link href={`/product/${p.productId}`} className="lk">Buy again</Link></div><b>{inr(o.total)}</b></div>); })}
    </div>
  );
}
