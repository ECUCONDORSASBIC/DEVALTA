import { HTMLAttributes } from 'react';
import type * as React from 'react';
import clsx from 'classnames';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  shadow?: boolean;
  children?: React.ReactNode;
}

export function Card({ className, children, shadow = true, ...rest }: CardProps) {
  const base = 'bg-white rounded-lg border border-gray-200';
  const shadowCls = shadow ? 'shadow-sm' : '';

  return (
    <div className={clsx(base, shadowCls, className)} {...rest}>
      {children}
    </div>
  );
}