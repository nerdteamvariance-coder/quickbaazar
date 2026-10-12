import Link from 'next/link';
import { allBrands } from '@/lib/db';
import { PageHead } from '@/components/Empty';

export const metadata = { title: 'All brands' };
export const dynamic = 'force-dynamic';
export default function Brands() {
  return (
    <div className="view"><PageHead title="All brands" sub="2,000+ brands, from high street to premium." crumb="Brands" />
      <div className="bgrid">{allBrands().map(b => <Link key={b} href={`/shop/all?brand=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
    </div>
  );
}
