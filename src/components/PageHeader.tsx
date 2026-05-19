import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Secondary line — keep short (mobile-first). */
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="max-w-xl space-y-2 sm:space-y-2.5">
        {eyebrow ? (
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-teal-800/85">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance text-[1.375rem] font-semibold leading-tight tracking-tight text-brand-ink sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-md text-pretty text-sm leading-normal text-slate-600 sm:text-[0.9375rem]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2 sm:min-w-[7rem] sm:justify-end">{actions}</div>
      ) : null}
    </header>
  );
}
