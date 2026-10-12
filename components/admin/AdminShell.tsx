'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RESOURCES } from '@/lib/resources';

export default function AdminShell({ user, badges, children }: { user: string; badges: Record<string, number>; children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter();
  const [open, setOpen] = useState(false); const [msg, setMsg] = useState('');
  useEffect(() => setOpen(false), [path]);
  const groups = [...new Set(RESOURCES.map(r => r.group))];
  const on = (h: string) => path === h || path.startsWith(h + '/');
  const purge = async () => { const r = await fetch('/api/admin/purge', { method: 'POST' }); setMsg(r.ok ? 'Storefront cache cleared' : 'Could not clear cache'); setTimeout(() => setMsg(''), 2200); router.refresh(); };
  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); location.href = '/admin/login'; };
  return (
    <div className={'adm' + (open ? ' open' : '')}>
      <div className="top">
        <div className="brand"><button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>☰</button><b>q</b><div>QuickBaazar<small>Admin panel</small></div></div>
        <div className="sp" />
        <Link href="/" target="_blank" className="btn ghost sm hidem" style={{ height: 36 }}>View store ↗</Link>
        <button className="pill" onClick={purge}>⟳ <span>Purge cache</span></button>
        <button className="who" onClick={logout} title="Log out"><span>{user}</span><div className="av">{user[0].toUpperCase()}</div></button>
      </div>
      <aside className="side">
        <Link href="/admin/dashboard" className={on('/admin/dashboard') ? 'on' : ''}><i>◧</i>Dashboard</Link>
        <Link href="/admin/analytics" className={on('/admin/analytics') ? 'on' : ''}><i>◭</i>Analytics</Link>
        <Link href="/admin/inventory" className={on('/admin/inventory') ? 'on' : ''}><i>▥</i>Inventory</Link>
        {groups.map(g => (
          <div key={g}><h6>{g}</h6>
            {RESOURCES.filter(r => r.group === g).map(r => <Link key={r.key} href={`/admin/${r.key}`} className={on(`/admin/${r.key}`) ? 'on' : ''}><i>{r.icon}</i>{r.label}{badges[r.key] ? <em>{badges[r.key]}</em> : null}</Link>)}
          </div>))}
        <h6>Store</h6>
        <Link href="/admin/settings" className={on('/admin/settings') ? 'on' : ''}><i>⚙</i>Settings</Link>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} />
      <main className="main">{children}</main>
      {msg && <div className="atoast">{msg}</div>}
    </div>
  );
}
