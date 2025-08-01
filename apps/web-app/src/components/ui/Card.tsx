import React from 'react';

export function Card({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any 
}) {
  return (
    <div className={`bg-white shadow-md rounded-lg border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any 
}) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any 
}) {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any 
}) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any 
}) {
  return (
    <div className={`px-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}