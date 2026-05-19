import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FormField } from '@/components/FormField';
import { PageHeader } from '@/components/PageHeader';
import { Stepper } from '@/components/Stepper';
import { getOrderById, getOrderLinesForOrder, getProductById } from '@/mock-data';

export function ReplaceWizardPage() {
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

  const firstWatchLine = getOrderLinesForOrder(order.id).find((l) => {
    const p = getProductById(l.productId);
    return p?.kind === 'watch';
  });

  const watchName = firstWatchLine ? getProductById(firstWatchLine.productId)?.name : 'Watch';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Replace"
        title="Replacement request"
        description="Wizard skeleton: issue selection, uploads, Care+ gate, address, preview—coming next."
        actions={
          <Button variant="secondary" onClick={() => navigate(`/service/order/${order.id}`)}>
            Back
          </Button>
        }
      />

      <Stepper
        activeIndex={1}
        steps={[
          { id: 'pick', label: 'Choose items', complete: true },
          { id: 'issue', label: 'Describe issue' },
          { id: 'contact', label: 'Contact & ship' },
          { id: 'review', label: 'Preview' },
        ]}
      />

      <Card>
        <p className="text-sm font-semibold text-brand-ink">IMEI (stub)</p>
        <p className="mt-2 text-sm text-slate-600">
          Deck: adding another watch may require IMEI again. Showing one field as a placeholder.
        </p>
        <div className="mt-4">
          <FormField id="imei" label={`IMEI for ${watchName ?? 'device'}`} hint="Invalid IMEI should inline in red and block Next (later).">
            <input
              id="imei"
              className="w-full rounded-xl border border-brand-line bg-white px-3 py-2 font-mono text-sm outline-none ring-brand-accent/40 focus:ring-4"
              placeholder="356789012345678"
            />
          </FormField>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-brand-line pt-6 sm:flex-row sm:justify-end">
          <Button variant="secondary" disabled>
            Add another
          </Button>
          <Button variant="secondary" onClick={() => navigate('/service/preview')}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
