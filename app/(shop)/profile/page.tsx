'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/Store';
import { api } from '@/lib/util';

const Row = ({ href, d, label }: { href: string; d: string; label: string }) => (
  <Link href={href}><svg className="i" viewBox="0 0 24 24"><path d={d} /></svg><span>{label}</span><span className="ch"><svg className="i" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></span></Link>);

export default function Profile() {
  const { user, refreshUser, toast } = useStore(); const router = useRouter();
  const name = user?.name || 'Guest';
  return (
    <div className="view">
      <div className="prof"><div className="av">{name[0].toUpperCase()}</div><h1 className="disp" style={{ fontSize: 28 }}>{name}</h1>
        <div className="pills"><span className="pill">✦ QuickBaazar Insider · Join</span><span className="pill">₹0 QuickCash</span></div></div>
      <div className="list">
        <Row href="/orders" d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" label="My orders" />
        <Row href="/wishlist" d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" label="Wishlist" />
        <Row href="/track" d="M3 7h11v9H3zM14 10h4l3 3v3h-7" label="Track an order" />
        <Row href="/offers" d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" label="Coupons & offers" />
      </div>
      <div className="list">
        <Row href="/help" d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM17 14h3v5h-3z" label="Help centre" />
        <Row href="/about" d="M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" label="About QuickBaazar" />
      </div>
      {user ? <button className="logout" onClick={async () => { await api('/api/auth/logout', { method: 'POST' }); await refreshUser(); toast('Logged out'); router.push('/'); }}>LOG OUT</button>
        : <Link className="btn block" href="/login">Log in or sign up</Link>}
      <p style={{ textAlign: 'center', color: 'var(--mute)', fontSize: 12, margin: '10px 0' }}>APP VERSION 1.0.0</p>
    </div>
  );
}
