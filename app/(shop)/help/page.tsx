import Link from 'next/link';
import { FAQ } from '@/lib/data';
import { PageHead } from '@/components/Empty';

export const metadata = { title: 'Help centre' };
export default function Help() {
  return (
    <div className="view"><PageHead title="How can we help?" sub="Search or browse the questions people ask most." crumb="Help" />
      <div className="pg c3">
        <Link className="pn" href="/track"><h3>Track order</h3><p>See where it is right now</p></Link>
        <Link className="pn" href="/orders"><h3>Returns & exchanges</h3><p>Start one in two taps</p></Link>
        <Link className="pn" href="/contact"><h3>Contact us</h3><p>Chat, call or email</p></Link>
      </div>
      <h2 className="disp" style={{ margin: '20px 0 12px' }}>Frequently asked</h2>
      {FAQ.map(([q, a]) => <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}
    </div>
  );
}
