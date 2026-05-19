import type { ReactNode } from 'react';
import { supportBodySmall, supportEyebrow, supportPageTitle } from '@/ui/supportTheme';
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
        {eyebrow ? <p className={supportEyebrow}>{eyebrow}</p> : null}
        <h1 className={supportPageTitle}>{title}</h1>
        {description ? <p className={cn(supportBodySmall, 'max-w-md text-pretty sm:text-[15px]')}>{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2 sm:min-w-[7rem] sm:justify-end">{actions}</div>
      ) : null}
    </header>
  );
}
