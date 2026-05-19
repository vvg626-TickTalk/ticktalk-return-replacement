import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** When true, reduces horizontal padding for tight toolbars */
  compact?: boolean;
  children: ReactNode;
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition-[transform,box-shadow,background-color,border-color] disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.99]';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-night text-white shadow-sm hover:bg-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25',
  secondary:
    'border border-slate-200 bg-white text-brand-ink shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/20',
  ghost:
    'text-brand-night hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/15',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/35',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-10 px-3.5 text-sm',
  md: 'min-h-12 px-4 text-[0.9375rem] sm:text-[0.9375rem]',
  lg: 'min-h-[3.25rem] px-5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  compact,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        compact && 'px-3',
        className,
      )}
      {...props}
    />
  );
}
