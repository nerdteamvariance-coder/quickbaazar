import Link from 'next/link';
import Newsletter from './Newsletter';

const L = (items: [string, string][]) => <ul>{items.map(([h, l]) => <li key={l}><Link href={h}>{l}</Link></li>)}</ul>;

export default function Footer() {
  return (
    <footer className="foot">
      <div className="nl"><div className="wrap">
        <div><h3>Get 10% off your first order</h3><p style={{ opacity: 0.9, marginTop: 6 }}>Join for drops, early sales and style notes. No spam.</p></div>
        <Newsletter />
      </div></div>
      <div className="wrap">
        <div className="cols">
          <div className="brand">
            <Link href="/" className="logo"><b>q</b>quickbaazar</Link>
            <p>Fashion, footwear and beauty from 2,000+ brands. Easy returns and cash on delivery across India.</p>
            <div className="apps"><a href="#"><span><small>Download on the</small>App Store</span></a><a href="#"><span><small>Get it on</small>Google Play</span></a></div>
            <div className="soc"><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="X">x</a><a href="#" aria-label="YouTube">yt</a></div>
          </div>
          <div><h4>Shop</h4>{L([['/shop/men', 'Men'], ['/shop/women', 'Women'], ['/shop/kids', 'Kids'], ['/shop/footwear', 'Footwear'], ['/brands', 'Brands']])}</div>
          <div><h4>Help</h4>{L([['/track', 'Track order'], ['/help', 'Returns & refunds'], ['/help', 'FAQs'], ['/contact', 'Contact us']])}</div>
          <div><h4>Company</h4>{L([['/about', 'About us'], ['/offers', 'Offers'], ['/blog', 'Blog']])}</div>
          <div><h4>Account</h4>{L([['/login', 'Log in'], ['/orders', 'My orders'], ['/wishlist', 'Wishlist'], ['/profile', 'Profile']])}</div>
        </div>
        <div className="bot">
          <div className="pay">{['UPI', 'Visa', 'Mastercard', 'RuPay', 'NetBanking', 'COD'].map(x => <span key={x}>{x}</span>)}</div>
          <div>© 2026 QuickBaazar Retail Pvt Ltd · Terms · Privacy</div>
        </div>
      </div>
    </footer>
  );
}
