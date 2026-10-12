'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from './Store';

const T: [string, string, string][] = [
  ['/', 'Home', 'M4 11l8-7 8 7v9H4z'],
  ['/shop/all', 'Shop', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['/wishlist', 'Wishlist', 'M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z'],
  ['/bag', 'Bag', 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2'],
  ['/profile', 'Profile', 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-4 4-6 8-6s7 2 8 6'],
];
export default function BottomNav() {
  const p = usePathname(); const { cart } = useStore();
  const on = (h: string) => (h === '/' ? p === '/' : p.startsWith(h) || (h === '/shop/all' && p.startsWith('/product')));
  return (
    <nav className="bnav" aria-label="Primary">
      {T.map(([h, l, d]) => (
        <Link key={h} href={h} className={on(h) ? 'on' : ''}>
          <svg className="i" viewBox="0 0 24 24"><path d={d} /></svg>{l}
          {l === 'Bag' && cart.count > 0 && <span className="badge">{cart.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
