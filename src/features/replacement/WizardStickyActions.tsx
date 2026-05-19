import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Thumb-friendly primary actions; fixed on small screens, in-flow on `sm+`. */
export function WizardStickyActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/90 bg-white/92 px-4 py-3 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md sm:relative sm:inset-auto sm:z-0 sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-0',
        className,
      )}
      role="toolbar"
      aria-label="Next steps"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        {children}
      </div>
    </div>
  );
}
