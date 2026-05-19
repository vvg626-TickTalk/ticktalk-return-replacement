import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Button } from '@/components/Button';

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

const linkPrimaryClass =
  'inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-night px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-ink';

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
        'rounded-2xl border border-dashed border-brand-line bg-white/80 p-8 text-center shadow-card',
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-slate-700">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-brand-ink">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="mt-4">
          {action.to ? (
            <Link to={action.to} className={linkPrimaryClass}>
              {action.label}
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
