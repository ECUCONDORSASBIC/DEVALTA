import clsx from 'classnames';
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const variantMap: Record<string, string> = {
  primary: 'bg-[var(--am-primary-100)] text-[var(--am-primary-700)]',
  secondary: 'bg-[var(--am-secondary-100)] text-[var(--am-secondary-700)]',
  success: 'bg-[var(--am-success)]/10 text-[var(--am-success)]',
  warning: 'bg-[var(--am-warning)]/10 text-[var(--am-warning)]',
  danger: 'bg-[var(--am-danger)]/10 text-[var(--am-danger)]',
};

export function Badge({ variant = 'primary', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full', variantMap[variant], className)}
      {...rest}
    >
      {children}
    </span>
  );
}