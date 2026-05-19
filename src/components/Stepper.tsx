import { supportStepProgressFill } from '@/ui/supportTheme';
import { cn } from '@/utils/cn';

export type StepperStep = {
  id: string;
  label: string;
  /** Completed steps render with a check tone */
  complete?: boolean;
};

export type StepperProps = {
  steps: StepperStep[];
  /** Zero-based active index */
  activeIndex: number;
  className?: string;
};

export function Stepper({ steps, activeIndex, className }: StepperProps) {
  const safeIndex = Math.min(Math.max(activeIndex, 0), Math.max(steps.length - 1, 0));
  const current = steps[safeIndex];
  const pct = steps.length > 0 ? ((safeIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
          Step {safeIndex + 1} of {steps.length}
        </p>
        <p className="truncate text-right text-sm font-semibold text-support-navy">{current?.label}</p>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90" aria-hidden>
        <div
          className={cn('h-full rounded-full', supportStepProgressFill)}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol
        className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Progress"
      >
        {steps.map((step, idx) => {
          const isActive = idx === safeIndex;
          const isDone = step.complete || idx < safeIndex;
          return (
            <li key={step.id} className="shrink-0">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
                  isActive && 'bg-support-navy text-white shadow-sm ring-support-navy',
                  isDone && !isActive && 'bg-support-tint text-support-navy ring-support-navy/20',
                  !isDone && !isActive && 'bg-white text-slate-600 ring-slate-200/90',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="font-bold tabular-nums">{isDone && !isActive ? '✓' : idx + 1}</span>
                <span className="max-w-[9.5rem] truncate sm:max-w-[11rem]">{step.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
