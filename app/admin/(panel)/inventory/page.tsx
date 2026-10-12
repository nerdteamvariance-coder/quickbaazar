import { db } from '@/lib/store';
import InventoryTable from '@/components/admin/InventoryTable';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inventory · Admin' };
export default function Inventory() { const d = db(); return <InventoryTable low={d.settings.lowStockAt} />; }
