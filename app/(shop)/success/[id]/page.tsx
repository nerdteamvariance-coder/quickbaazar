import Link from 'next/link';
import { deliveryDate } from '@/lib/util';

export default async function Success({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="view" style={{ textAlign: 'center', padding: '30px 0' }}>
      <div className="ok">✓</div>
      <h1 className="disp" style={{ fontSize: 36 }}>Order placed</h1>
      <p style={{ color: 'var(--mute)', margin: '8px 0 4px' }}>Order <b style={{ color: 'var(--ink)' }}>{id}</b> is confirmed.</p>
      <p style={{ color: 'var(--mute)' }}>Arriving by <b style={{ color: 'var(--ink)' }}>{deliveryDate(5)}</b></p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
        <Link className="btn" href="/orders">View my orders</Link><Link className="btn ghost" style={{ border: '1.5px solid var(--line)' }} href="/shop/all">Keep shopping</Link>
      </div>
    </div>
  );
}
