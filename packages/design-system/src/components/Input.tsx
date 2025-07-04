import clsx from 'classnames';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'error' | 'success';
}

const stateRing: Record<string, string> = {
  default: 'focus:ring-[var(--am-primary-500)]',
  success: 'ring-[var(--am-success)] focus:ring-[var(--am-success)]',
  error: 'ring-[var(--am-danger)] focus:ring-[var(--am-danger)]',
};

export function Input({ state = 'default', className, ...rest }: InputProps) {
  return (
    <input
      className={clsx(
        'block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1',
        stateRing[state],
        className,
      )}
      {...rest}
    />
  );
}