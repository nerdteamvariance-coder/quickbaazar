import Link from 'next/link';
import { dashboardStats } from '@/lib/stats';
import { adminUser } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard · Admin' };
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

function Card({ t, n, chip, href, icon }: { t: string; n: string | number; chip: string; href?: string; icon: string }) {
  const body = <><span className="ic">{icon}</span><small className="t">{t}</small><div className="n">{n}</div><span className="chip">{chip}</span></>;
  return href ? <Link className="card" href={href}>{body}</Link> : <div className="card">{body}</div>;
}

export default function Dashboard() {
  const s = dashboardStats();
  const max = Math.max(1, ...s.series.map(x => x.revenue));
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <>
      <div className="welcome"><div><h1>Welcome back, Admin</h1><p>Here’s what’s happening with your store today — {today}</p></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg></div>
      <div className="cards">
        <Card t="Pending orders" n={s.orders.pending} chip={`Today ${s.orders.pendingToday}`} href="/admin/orders" icon="◔" />
        <Card t="Dispatched" n={s.orders.dispatched} chip={`Delivered ${s.orders.delivered}`} href="/admin/orders" icon="▦" />
        <Card t="Cancelled orders" n={s.orders.cancelled} chip={`Today ${s.orders.cancelledToday}`} href="/admin/orders" icon="✕" />
        <Card t="Return orders" n={s.orders.returned} chip="All time" href="/admin/orders" icon="↩" />
        <Card t="Revenue" n={inr(s.revenue)} chip={`Today ${inr(s.revenueToday)}`} icon="◎" />
        <Card t="Abandoned checkouts" n={s.checkouts.abandoned} chip={`${inr(s.checkouts.value)} waiting`} href="/admin/checkouts" icon="⚑" />
        <Card t="Recovered carts" n={s.checkouts.recovered} chip="Won back" href="/admin/checkouts" icon="↺" />
        <Card t="Reviews to approve" n={s.reviews.pending} chip="Pending" href="/admin/reviews" icon="★" />
        <Card t="Customers" n={s.customers.total} chip={`Today ${s.customers.today}`} href="/admin/customers" icon="☺" />
        <Card t="Newsletter" n={s.subscribers.total} chip={`Today ${s.subscribers.today}`} href="/admin/subscribers" icon="✦" />
        <Card t="Open enquiries" n={s.enquiries.open} chip={`Total ${s.enquiries.total}`} href="/admin/enquiries" icon="✉" />
        <Card t="Total products" n={s.products.total} chip={`Active ${s.products.active}`} href="/admin/products" icon="▤" />
        <Card t="Inactive products" n={s.products.inactive} chip={`Out of stock ${s.products.outOfStock}`} href="/admin/products" icon="▢" />
        <Card t="Live banners" n={s.banners.live} chip={`Total ${s.banners.total}`} href="/admin/banners" icon="▣" />
        <Card t="Active coupons" n={s.coupons.active} chip={`Total ${s.coupons.total}`} href="/admin/coupons" icon="%" />
        <Card t="Blog posts" n={s.blogs.published} chip={`Total ${s.blogs.total}`} href="/admin/blogs" icon="✎" />
      </div>
      <div className="two">
        <div className="panel"><h2>Revenue — last 7 days</h2>
          <div className="bars">{s.series.map(d => <div key={d.label} title={`${inr(d.revenue)} · ${d.orders} orders`}><span>{d.revenue ? inr(d.revenue) : ''}</span><i style={{ height: `${(d.revenue / max) * 100}%` }} />{d.label}</div>)}</div></div>
        <div className="panel"><h2>Low stock <Link href="/admin/products">Manage</Link></h2>
          {s.products.lowStock.length ? <table style={{ minWidth: 0 }}><tbody>{s.products.lowStock.slice(0, 6).map(p => <tr key={p.id}><td style={{ padding: '8px 0' }}><b>{p.brand}</b><br /><small style={{ color: 'var(--mute)' }}>{p.name}</small></td><td style={{ textAlign: 'right' }}><span className="abadge warn">{p.stock} left</span></td></tr>)}</tbody></table> : <p style={{ color: 'var(--mute)' }}>Every product is well stocked.</p>}</div>
      </div>
      <div className="panel"><h2>Recent orders <Link href="/admin/orders">View all</Link></h2>
        <div className="tw" style={{ boxShadow: 'none' }}><table><thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{s.recentOrders.map(o => <tr key={o.id}><td><b>{o.id}</b></td><td>{o.address?.name || o.phone}</td><td>{new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td><td>{inr(o.total)}</td><td><span className={'abadge ' + ({ Delivered: 'ok', Shipped: 'blue', 'Out for delivery': 'blue', Placed: 'warn', Packed: 'warn', Cancelled: 'bad', Returned: 'bad' } as any)[o.status]}>{o.status}</span></td></tr>)}</tbody></table></div></div>
      <p style={{ color: 'var(--mute)', marginTop: 16, fontSize: 12.5 }}>Signed in as {adminUser()}</p>
    </>
  );
}
