import React from 'react';

interface TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function Textarea({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  className = ''
}: TextareaProps) {
  const baseClasses = 'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${baseClasses} ${className}`}
    />
  );
} 