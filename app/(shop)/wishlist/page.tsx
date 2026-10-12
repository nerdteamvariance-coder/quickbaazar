'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/components/Store';
import ProductCard from '@/components/ProductCard';
import { Empty } from '@/components/Empty';
import { api } from '@/lib/util';

export default function Wishlist() {
  const { wish } = useStore(); const [items, setItems] = useState<any[] | null>(null);
  useEffect(() => { api('/api/wishlist').then(r => setItems(r.items)); }, [wish]);
  if (items === null) return <div className="view" style={{ padding: 60, textAlign: 'center', color: 'var(--mute)' }}>Loading…</div>;
  if (!items.length) return <Empty title="Nothing saved yet" text="Tap the heart on anything you like and it lands here." cta="Browse products" href="/shop/all" />;
  return <div className="view"><div className="ptitle"><h1>Wishlist<small>{items.length} items</small></h1></div><div className="grid">{items.map(p => <ProductCard key={p.id} p={p} />)}</div></div>;
}
