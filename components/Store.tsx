'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/util';
import { track, toItem } from '@/lib/track';

export type Cart = { items: { id: number; productId: number; size: string; qty: number; product: any }[]; count: number; mrp: number; subtotal: number; discount: number; coupon: string | null; couponOff: number; shipping: number; total: number; freeShipLeft: number };
const empty: Cart = { items: [], count: 0, mrp: 0, subtotal: 0, discount: 0, coupon: null, couponOff: 0, shipping: 0, total: 0, freeShipLeft: 799 };

type Ctx = {
  cart: Cart; wish: number[]; user: { phone: string; name: string } | null; ready: boolean;
  addToCart: (productId: number, size: string, qty?: number) => Promise<void>;
  setQty: (index: number, qty: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>; removeCoupon: () => Promise<void>;
  toggleWish: (id: number) => Promise<void>; refreshCart: () => Promise<void>; refreshUser: () => Promise<void>;
  toast: (m: string) => void; openSheet: (n: ReactNode) => void; closeSheet: () => void;
};
const C = createContext<Ctx>(null as any);
export const useStore = () => useContext(C);

export default function Store({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(empty);
  const [wish, setWish] = useState<number[]>([]);
  const [user, setUser] = useState<Ctx['user']>(null);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState('');
  const [sheet, setSheet] = useState<ReactNode>(null);
  const t = useRef<any>(undefined);

  const toast = useCallback((m: string) => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(''), 1900); }, []);
  const refreshCart = useCallback(async () => setCart(await api('/api/cart')), []);
  const refreshUser = useCallback(async () => setUser((await api('/api/me')).user), []);
  useEffect(() => {
    Promise.all([refreshCart(), api('/api/wishlist').then(w => setWish(w.ids)), refreshUser()]).finally(() => setReady(true));
  }, [refreshCart, refreshUser]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(null); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);

  const wrap = (fn: () => Promise<void>) => fn().catch((e: Error) => toast(e.message));
  const value: Ctx = {
    cart, wish, user, ready, toast, openSheet: setSheet, closeSheet: () => setSheet(null), refreshCart, refreshUser,
    addToCart: (productId, size, qty = 1) => wrap(async () => {
      const c: Cart = await api('/api/cart', { method: 'POST', body: JSON.stringify({ productId, size, qty }) }); setCart(c); toast('Added to bag');
      const it = c.items.find(i => i.productId === productId && i.size === size); if (it) track('add_to_cart', { value: it.product.price * qty, items: [toItem(it.product, qty, size)] });
    }),
    setQty: (index, qty) => wrap(async () => {
      const line = cart.items[index]; setCart(await api('/api/cart', { method: 'PATCH', body: JSON.stringify({ index, qty }) }));
      if (line && qty < line.qty) track('remove_from_cart', { value: line.product.price * (line.qty - Math.max(qty, 0)), items: [toItem(line.product, line.qty - Math.max(qty, 0), line.size)] });
    }),
    applyCoupon: code => wrap(async () => { setCart(await api('/api/cart/coupon', { method: 'POST', body: JSON.stringify({ code }) })); toast(code.toUpperCase() + ' applied'); }),
    removeCoupon: () => wrap(async () => setCart(await api('/api/cart/coupon', { method: 'DELETE' }))),
    toggleWish: id => wrap(async () => {
      const on = wish.includes(id);
      const r = await api('/api/wishlist', { method: on ? 'DELETE' : 'POST', body: JSON.stringify({ productId: id }) });
      setWish(r.ids); toast(on ? 'Removed from wishlist' : 'Saved to wishlist');
      if (!on) track('add_to_wishlist', { items: [{ item_id: String(id) }] });
    }),
  };
  return (
    <C.Provider value={value}>
      {children}
      <div className={'scrim' + (sheet ? ' on' : '')} onClick={() => setSheet(null)} />
      <div className={'sheet' + (sheet ? ' on' : '')} role="dialog" aria-modal="true"><div className="grab" />{sheet}</div>
      <div className={'toast' + (msg ? ' on' : '')} role="status">{msg}</div>
    </C.Provider>
  );
}
