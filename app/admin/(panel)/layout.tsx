import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/store';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await currentAdmin();
  if (!user) redirect('/admin/login');
  const d = db();
  const idle = d.settings.abandonAfterMin * 60000;
  const badges = { orders: d.orders.filter(o => o.status === 'Placed').length, enquiries: d.enquiries.filter(e => e.status === 'new').length, reviews: d.reviews.filter(r => r.status === 'pending').length,
    checkouts: d.checkouts.filter(c => ['open', 'reminded'].includes(c.status) && Date.now() - +new Date(c.updatedAt) > idle).length };
  return <AdminShell user={user} badges={badges}>{children}</AdminShell>;
}
