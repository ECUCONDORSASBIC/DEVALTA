import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({ 
  children, 
  htmlFor,
  className = ''
}: LabelProps) {
  const baseClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
  
  return (
    <label
      htmlFor={htmlFor}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </label>
  );
} 