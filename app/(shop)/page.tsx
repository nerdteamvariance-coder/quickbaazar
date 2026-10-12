import Link from 'next/link';
import { STORIES } from '@/lib/data';
import { db, activeProducts } from '@/lib/store';
import { disc, grad, inr, emph } from '@/lib/util';
import ProductCard from '@/components/ProductCard';
import Pic from '@/components/Pic';
import { Hero, Stories, Countdown } from '@/components/HomeClient';

const Sh = ({ kick, title, href, label }: { kick?: string; title: string; href?: string; label?: string }) => (
  <div className="sh"><div>{kick && <span className="kick">{kick}</span>}<h2>{title}</h2></div>{href && <Link href={href}>{label || 'See all'}</Link>}</div>
);
const SV = (d: string) => <svg className="i" viewBox="0 0 24 24"><path d={d} /></svg>;

export const dynamic = 'force-dynamic';

export default function Home() {
  const PRODUCTS = activeProducts();
  const banners = db().banners.filter(b => b.active && b.placement === 'hero').sort((a, b) => a.sort - b.sort);
  const HERO = banners.map(b => ({ image: b.image, chip: b.chip, h: emph(b.title), t: b.subtitle, href: b.href || '/shop/all' }));
  const flash = [...PRODUCTS].sort((a, b) => disc(b) - disc(a)).slice(0, 8);
  const brands = ['Puma', 'Skechers', 'Campus', 'Roadster', 'HRX', 'Libas', 'Anouk', 'Allen Solly', 'H&M', 'Bacca Bucci'];
  return (
    <div className="view">
      <div className="tabs" style={{ marginTop: 4 }}>{['All', 'Men', 'Women', 'Kids'].map((t, i) => <Link key={t} className={'tab' + (i ? '' : ' on')} href={`/shop/${i ? t.toLowerCase() : 'all'}`}>{t}</Link>)}</div>
      {HERO.length > 0 && <Hero slides={HERO} />}
      <Stories stories={STORIES} />
      <div className="bank"><div className="pct">10%</div><div><b>Instant discount on bank cards</b><div style={{ color: 'var(--mute)', fontSize: 13 }}>On HDFC Credit Cards & EMI, up to ₹1,500</div></div></div>
      <div className="usp">
        <div>{SV('M3 7h11v9H3zM14 10h4l3 3v3h-7')}<span>Free delivery<small>On orders over ₹799</small></span></div>
        <div>{SV('M3 12a9 9 0 1 0 3-6.7M3 4v4h4')}<span>14-day returns<small>No questions asked</small></span></div>
        <div>{SV('M3 6h18v12H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z')}<span>Cash on delivery<small>Pay when it arrives</small></span></div>
        <div>{SV('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4')}<span>100% authentic<small>Verified brands only</small></span></div>
      </div>

      <section className="sec"><Sh kick="Just for you" title="Trending now" href="/shop/all" /><div className="hs">{PRODUCTS.slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}</div></section>

      <section className="sec"><Sh kick="Shop by occasion" title="Where are you headed?" />
        <div className="occ">{[['Office', 'cloth', 'Shirts, blazers'], ['Festive', 'w1', 'Kurtas, ethnic'], ['Party', 'w3', 'Co-ords, dresses'], ['Gym', 'sneaker4', 'Shoes, tees'], ['Brunch', 'w2', 'Dresses, tops'], ['Weekend', 'knit', 'Knits, sneakers']].map(([n, k, s], i) => (
          <Link key={n} className="oc" href="/shop/all" style={{ background: grad(i) }}><Pic k={k} /><div><b>{n}</b><small>{s}</small></div></Link>))}</div></section>

      <section className="sec"><div className="flash">
        <div className="fh"><span className="chip"><i className="live" /> Lightning deals</span><h2>Ends in</h2><Countdown /></div>
        <div className="hs">{flash.map(p => { const c = 48 + (p.id * 13) % 47; return (
          <Link key={p.id} href={`/product/${p.id}`} className="fc2"><div className="ph" style={{ background: grad(p.id) }}><Pic k={p.image} /><em>{disc(p)}% OFF</em></div>
            <div className="t"><b>{inr(p.price)}</b> <s style={{ color: 'var(--mute)', fontSize: 12 }}>{inr(p.mrp)}</s><div className="bar"><i style={{ width: c + '%' }} /></div><small>{c}% claimed</small></div></Link>); })}</div>
      </div></section>

      <section className="sec"><Sh kick="Collections" title="Shop by vibe" />
        <div className="bento">
          <Link className="bn t" href="/shop/women" style={{ background: grad(0) }}><Pic k="w1" /><span>Festive fits<small>From ₹499</small></span></Link>
          <Link className="bn" href="/shop/footwear" style={{ background: grad(4) }}><Pic k="sneaker3" /><span>Sneaker drop<small>Up to 64% off</small></span></Link>
          <Link className="bn" href="/shop/men" style={{ background: grad(1) }}><Pic k="knit" /><span>Layer up<small>Knits & jackets</small></span></Link>
          <Link className="bn" href="/shop/beauty" style={{ background: grad(3) }}><Pic k="w4" /><span>Beauty<small>Min. 30% off</small></span></Link>
          <Link className="bn w" href="/shop/kids" style={{ background: grad(3) }}><Pic k="rack" /><span>Mini wardrobe<small>Under ₹599</small></span></Link>
          <Link className="bn" href="/shop/men" style={{ background: grad(2) }}><Pic k="tee" /><span>Tees<small>From ₹449</small></span></Link>
        </div></section>

      <section className="sec"><div className="botd"><div className="im" style={{ background: grad(0) }}><Pic k="sneaker1" w={1000} /></div>
        <div className="tx"><span className="chip">Brand of the day</span><h3>Puma</h3><p>Court classics and running essentials. Up to 62% off today only, with free delivery on every order.</p>
          <div className="sm">{PRODUCTS.filter(p => p.brand === 'Puma' || p.brand === 'Bacca Bucci').slice(0, 3).map(p => <div key={p.id}><Pic k={p.image} w={300} /></div>)}</div><Link className="btn" href="/shop/footwear">Shop Puma</Link></div></div></section>

      <section className="sec"><Sh kick="Deals" title="Deals of the day" href="/offers" label="All offers" />
        <div className="minoff">{[['Sneakers', 'sneaker1', 'footwear', 'Min. 40% off'], ['Kurta sets', 'w1', 'women', 'Min. 50% off'], ['T-shirts', 'tee', 'men', 'From ₹449'], ['Dresses', 'w2', 'women', 'Min. 55% off'], ['Knitwear', 'knit', 'men', 'Min. 40% off'], ['Kidswear', 'rack', 'kids', 'Under ₹599'], ['Formal shirts', 'cloth', 'men', 'Min. 45% off'], ['Beauty picks', 'w4', 'beauty', 'Min. 30% off']].map(([n, k, c, o]) => (
          <Link key={n} href={`/shop/${c}`}><div className="ph"><Pic k={k} /></div><div className="t"><b>{n}</b><span>{o}</span></div></Link>))}</div></section>

      <section className="sec"><div className="marq"><div>{[...brands, ...brands].map((b, i) => <span key={i}>{b}</span>)}</div></div></section>

      <section className="sec"><Sh kick="Loved by 2M+ shoppers" title="What customers say" />
        <div className="rev">{[['Fit was exactly right and it showed up in two days. Return pickup was painless too.', 'Aisha K.', 'Mumbai · Puma sneakers'], ['Prices dropped while it sat in my bag and the app told me. Never seen that before.', 'Rohan M.', 'Pune · Kurta set'], ['Ordered a size up to be safe, exchanged in one tap. This is how shopping should work.', 'Sneha R.', 'Delhi · Co-ord set']].map(r => (
          <div className="rv" key={r[1]}><div className="st">★★★★★</div><p>“{r[0]}”</p><b>{r[1]}</b> <small>{r[2]}</small></div>))}</div></section>

      <section className="sec"><div className="app"><div><span className="chip">QuickBaazar app</span><h3 style={{ margin: '10px 0' }}>Extra 10% off<br />your first app order</h3><p style={{ opacity: 0.9, marginBottom: 14 }}>Track orders live, get price-drop alerts and early access to sales.</p>
        <div className="apps"><a href="#"><span><small>Download on the</small>App Store</span></a><a href="#"><span><small>Get it on</small>Google Play</span></a></div></div></div></section>

      <section className="sec"><Sh kick="More to love" title="Recommended for you" /><div className="grid">{PRODUCTS.slice(8).map(p => <ProductCard key={p.id} p={p} />)}</div></section>
    </div>
  );
}
