import '../globals.css';
import Store from '@/components/Store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import Analytics from '@/components/Analytics';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic'; // reads tracking IDs and live store data on every request

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { gtmId, ga4Id, metaPixelId } = db().settings;
  const gtmOk = /^GTM-[A-Z0-9]{4,12}$/.test(gtmId || '');
  return (
    <Store>
      {gtmOk && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>}
      <Analytics gtm={gtmId} ga4={ga4Id} pixel={metaPixelId} />
      <Header />
      <main className="wrap">{children}</main>
      <Footer />
      <BottomNav />
    </Store>
  );
}
