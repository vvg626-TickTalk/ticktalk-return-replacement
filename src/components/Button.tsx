import type { ButtonHTMLAttributes, ReactNode } from 'react';
import {
  supportButtonDanger,
  supportButtonGhost,
  supportButtonPrimary,
  supportButtonSecondary,
} from '@/ui/supportTheme';
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

const variantClass: Record<Variant, string> = {
  primary: supportButtonPrimary,
  secondary: supportButtonSecondary,
  ghost: supportButtonGhost,
  danger: supportButtonDanger,
};

const sizeModifiers: Record<Size, string> = {
  sm: '!px-4 !text-sm',
  md: '',
  lg: '!px-8 !text-base',
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
      className={cn(variantClass[variant], sizeModifiers[size], compact && '!px-3', className)}
      {...props}
    />
  );
}
