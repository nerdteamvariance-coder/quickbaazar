import { PageHead } from '@/components/Empty';

export const metadata = { title: 'About us' };
export default function About() {
  return (
    <div className="view"><PageHead title="Clothes you’ll actually wear" sub="QuickBaazar started with one rule: if it doesn’t fit, send it back free. Everything else follows from that." crumb="About" />
      <div className="stats"><div><b>2M+</b>happy shoppers</div><div><b>2,000+</b>brands</div><div><b>14 days</b>free returns</div><div><b>19k</b>pin codes served</div></div>
      <div className="pg c3">
        <div className="pn"><h3>Real brands only</h3><p>Every product is sourced straight from the brand or an authorised seller. No fakes, ever.</p></div>
        <div className="pn"><h3>Returns without drama</h3><p>Schedule a pickup in two taps. Refunds reach you within 48 hours of pickup.</p></div>
        <div className="pn"><h3>Prices that move down</h3><p>We tell you when something in your bag or wishlist drops in price.</p></div>
      </div>
    </div>
  );
}
