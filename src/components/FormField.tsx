import type { LabelHTMLAttributes, ReactNode } from 'react';
import { supportErrorCallout } from '@/ui/supportPortalLayout';
import { cn } from '@/utils/cn';

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  /** Dense support-portal row: smaller label, tighter spacing */
  compact?: boolean;
  labelProps?: Omit<LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor' | 'children'>;
};

export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
  compact,
  labelProps,
}: FormFieldProps) {
  return (
    <div className={cn(compact ? 'space-y-1' : 'space-y-2', className)}>
      <label
        htmlFor={id}
        className={cn(
          compact
            ? 'block text-[11px] font-semibold uppercase tracking-wide text-slate-600'
            : 'block text-[0.8125rem] font-semibold leading-snug text-slate-800',
        )}
        {...labelProps}
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p
          id={`${id}-hint`}
          className={cn(compact ? 'text-[11px] leading-tight text-slate-500' : 'text-xs leading-snug text-slate-500')}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className={cn(
            compact
              ? supportErrorCallout
              : 'rounded-xl bg-red-50 px-3 py-2 text-sm font-medium leading-snug text-red-800 ring-1 ring-red-100/80',
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
