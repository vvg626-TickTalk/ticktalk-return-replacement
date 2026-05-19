import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  /** Lower visual weight (nested sections) */
  muted?: boolean;
};

const paddingMap = {
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-7',
};

export function Card({
  children,
  padding = 'md',
  muted = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.04]',
        muted && 'border-slate-100/90 bg-slate-50/50 shadow-sm',
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
