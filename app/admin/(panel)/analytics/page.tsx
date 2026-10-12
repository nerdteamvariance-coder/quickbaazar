import { analytics } from '@/lib/stats';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics · Admin' };
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function Analytics() {
  const a = analytics(); const max = Math.max(1, ...a.days.map(d => d.revenue)); const f = a.funnel; const top = Math.max(1, f.carts);
  return (
    <>
      <div className="tbar"><h1>Analytics</h1></div>
      <div className="kpis">
        <div><small>Revenue</small><b>{inr(a.revenue)}</b></div><div><small>Orders</small><b>{a.orders}</b></div>
        <div><small>Average order value</small><b>{inr(a.aov)}</b></div><div><small>Cart abandonment</small><b>{f.abandonedRate}%</b></div>
      </div>
      <div className="panel"><h2>Revenue — last 30 days</h2>
        <div className="bars" style={{ gap: 4 }}>{a.days.map((d, i) => <div key={i} title={`${d.label}: ${inr(d.revenue)} · ${d.orders} orders`}><i style={{ height: `${(d.revenue / max) * 100}%` }} /></div>)}</div></div>
      <div className="two">
        <div className="panel"><h2>Shopping funnel</h2>
          <div className="funnel">
            <div><span>Added to bag</span><i style={{ width: `${(f.carts / top) * 100}%` }} /><b>{f.carts}</b></div>
            <div><span>Reached checkout</span><i style={{ width: `${(f.reached / top) * 100}%` }} /><b>{f.reached}</b></div>
            <div><span>Placed an order</span><i style={{ width: `${(f.converted / top) * 100}%` }} /><b>{f.converted}</b></div>
          </div>
          <p style={{ color: 'var(--mute)', marginTop: 12 }}>{f.recovered} {f.recovered === 1 ? 'cart was' : 'carts were'} won back after a reminder.</p></div>
        <div className="panel"><h2>Payment methods</h2>
          {a.payments.length ? <table style={{ minWidth: 0 }}><tbody>{a.payments.map(p => <tr key={p.method}><td style={{ padding: '8px 0', textTransform: 'uppercase', fontWeight: 700 }}>{p.method}</td><td style={{ textAlign: 'right' }}>{p.orders} {p.orders === 1 ? 'order' : 'orders'}</td></tr>)}</tbody></table> : <p style={{ color: 'var(--mute)' }}>No orders yet.</p>}
          <h2 style={{ marginTop: 18 }}>Coupons used</h2>
          {a.coupons.length ? <table style={{ minWidth: 0 }}><tbody>{a.coupons.map(c => <tr key={c.code}><td style={{ padding: '8px 0', fontWeight: 700 }}>{c.code}</td><td style={{ textAlign: 'right' }}>{c.uses}×</td></tr>)}</tbody></table> : <p style={{ color: 'var(--mute)' }}>No coupon orders yet.</p>}</div>
      </div>
      <div className="two">
        <div className="panel"><h2>Best sellers</h2>
          {a.topProducts.length ? <div className="tw" style={{ boxShadow: 'none' }}><table><thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{a.topProducts.map(p => <tr key={p.name}><td><b>{p.brand}</b><br /><small style={{ color: 'var(--mute)' }}>{p.name}</small></td><td>{p.units}</td><td>{inr(p.revenue)}</td></tr>)}</tbody></table></div> : <p style={{ color: 'var(--mute)' }}>No sales yet.</p>}</div>
        <div className="panel"><h2>Most wishlisted</h2>
          {a.wishlist.length ? <table style={{ minWidth: 0 }}><tbody>{a.wishlist.map(w => <tr key={w.id}><td style={{ padding: '8px 0' }}>{w.name}</td><td style={{ textAlign: 'right' }}><span className="abadge blue">{w.users} saved</span></td></tr>)}</tbody></table> : <p style={{ color: 'var(--mute)' }}>Nothing wishlisted yet.</p>}</div>
      </div>
    </>
  );
}
