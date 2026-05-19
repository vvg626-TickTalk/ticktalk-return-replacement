import type { HTMLAttributes, ReactNode } from 'react';
import { supportPanel } from '@/ui/supportTheme';
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
        supportPanel,
        muted && 'border-slate-100/90 bg-slate-50/40 shadow-sm shadow-slate-900/[0.02]',
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
