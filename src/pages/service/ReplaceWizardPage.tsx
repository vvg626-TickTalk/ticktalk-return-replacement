import { useParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { ReplaceFlowWizard } from '@/features/replacement/ReplaceFlowWizard';
import { getOrderById } from '@/mock-data';

export function ReplaceWizardPage() {
  const { orderId = '' } = useParams();
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

  return <ReplaceFlowWizard order={order} />;
}
