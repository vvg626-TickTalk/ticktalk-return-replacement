import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { Stepper } from '@/components/Stepper';
import { getOrderById } from '@/mock-data';

export function ReturnWizardPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const order = getOrderById(orderId);

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="Use a mock order ID like ord-101."
        action={{ label: 'Order lookup', to: '/service/order-lookup' }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Return"
        title="Return request"
        description="Skeleton only. Preview should clarify fees, gifts, and policy blocks per docs."
        actions={
          <Button variant="secondary" onClick={() => navigate(`/service/order/${order.id}`)}>
            Back
          </Button>
        }
      />

      <Stepper
        activeIndex={0}
        steps={[
          { id: 'pick', label: 'Choose items' },
          { id: 'reason', label: 'Reasons' },
          { id: 'ship', label: 'Label & ship info' },
          { id: 'review', label: 'Preview' },
        ]}
      />

      <Card>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-teal-800">•</span>
            Gift lines: accessories may be exchange-only; bundles tracked as one unit (see requirements).
          </li>
          <li className="flex gap-2">
            <span className="text-teal-800">•</span>
            Add another / disabled states come later.
          </li>
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" disabled>
            Add another
          </Button>
          <Button onClick={() => navigate('/service/preview')}>Next</Button>
        </div>
      </Card>
    </div>
  );
}
