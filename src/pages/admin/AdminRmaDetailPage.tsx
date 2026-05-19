import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getOrderById, getRmaById } from '@/mock-data';

export function AdminRmaDetailPage() {
  const { rmaId = '' } = useParams();
  const navigate = useNavigate();
  const rma = getRmaById(rmaId);

  if (!rma) {
    return (
      <EmptyState
        title="RMA not found"
        description="Open a row from Returns or Replacements."
        action={{ label: 'Dashboard', to: '/admin' }}
      />
    );
  }

  const order = getOrderById(rma.orderId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`RMA #${rma.code}`}
        description="Internal detail stub. Staff messaging UX is still an open product question."
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kind</p>
          <p className="mt-2 text-sm font-semibold capitalize text-support-navy">{rma.kind.replace('_', ' ')}</p>
        </div>
        <StatusBadge status={rma.status} />
      </Card>

      <Card>
        <p className="text-sm font-semibold text-support-navy">Linked order</p>
        <p className="mt-2 font-mono text-sm text-slate-700">{rma.orderId}</p>
        {order ? (
          <div className="mt-3 text-sm">
            <Link className="font-semibold text-support-navy hover:underline" to={`/service/order/${order.id}`}>
              Preview customer order page
            </Link>
          </div>
        ) : null}
      </Card>

      <Card className="border-dashed">
        <p className="text-sm font-semibold text-support-navy">Next implementation steps</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>State transition buttons with guardrails</li>
          <li>Message thread + templates</li>
          <li>Inventory allocation (colors / restock queue)</li>
        </ul>
      </Card>
    </div>
  );
}
