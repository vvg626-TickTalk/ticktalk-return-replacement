import { useParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { ReturnFlowWizard } from '@/features/return/ReturnFlowWizard';
import { getOrderById } from '@/mock-data';

export function ReturnWizardPage() {
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

  return <ReturnFlowWizard order={order} />;
}
