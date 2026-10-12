import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/adminAuth';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';
export default async function AdminLogin() {
  if (await currentAdmin()) redirect('/admin/dashboard');
  const demo = !process.env.ADMIN_PASSWORD;
  return <LoginForm demo={demo} />;
}
