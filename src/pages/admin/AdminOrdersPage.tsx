import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { OrderCard } from '@/components/OrderCard';
import { orders } from '@/mock-data';

export function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Sales orders (mock list)." />

      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} to={`/service/order/${order.id}`} className="block">
            <OrderCard order={order} subtitle={`Internal id · ${order.id}`} />
          </Link>
        ))}
      </div>

      <Card className="border-dashed text-sm text-slate-600">
        Admin actions (refunds, overrides) are intentionally not implemented in Phase 1.
      </Card>
    </div>
  );
}
