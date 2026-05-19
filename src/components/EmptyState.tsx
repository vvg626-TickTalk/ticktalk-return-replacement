import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { supportButtonPrimary, supportPanel } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        supportPanel,
        'border-dashed border-slate-200/90 bg-white/90 p-8 text-center shadow-sm',
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-support-tint/80 text-support-navy ring-1 ring-support-navy/8">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold leading-tight text-support-navy sm:text-xl">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-[15px]">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-4">
          {action.to ? (
            <Link to={action.to} className={cn(supportButtonPrimary, 'inline-flex w-full max-w-xs justify-center sm:w-auto')}>
              {action.label}
            </Link>
          ) : (
            <Button onClick={action.onClick} className="w-full max-w-xs sm:w-auto">
              {action.label}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
