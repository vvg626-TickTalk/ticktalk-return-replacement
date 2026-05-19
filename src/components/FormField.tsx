import type { LabelHTMLAttributes, ReactNode } from 'react';
import { supportErrorCallout, supportLabel, supportLabelCompact } from '@/ui/supportTheme';
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
        className={cn(compact ? cn('block', supportLabelCompact) : cn('block', supportLabel))}
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
        <p id={`${id}-error`} className={supportErrorCallout} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
