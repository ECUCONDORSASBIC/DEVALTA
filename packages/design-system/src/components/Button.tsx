import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'classnames';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...rest }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants: Record<string, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
      ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';