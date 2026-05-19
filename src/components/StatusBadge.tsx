import type { RmaStatus } from '@/types/models';
import { RMA_STATUS_CUSTOMER_LABEL } from '@/features/serviceOrder/rmaStatusLabels';
import { supportRmaStatusBadgeClasses, supportStatusBadgeBase } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

export type StatusBadgeProps = {
  status: RmaStatus | string;
  className?: string;
};

function labelForStatus(status: string): string {
  if (status in RMA_STATUS_CUSTOMER_LABEL) {
    return RMA_STATUS_CUSTOMER_LABEL[status as RmaStatus];
  }
  return status.replace(/_/g, ' ');
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = String(status);
  const tone = supportRmaStatusBadgeClasses(key);
  const label = labelForStatus(key);

  return (
    <span className={cn(supportStatusBadgeBase, tone, className)}>
      {label}
    </span>
  );
}
