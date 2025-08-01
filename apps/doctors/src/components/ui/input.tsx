import React from 'react';

interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  id?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function Input({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  id,
  className = '',
  onKeyPress
}: InputProps) {
  const baseClasses = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyPress={onKeyPress}
      className={`${baseClasses} ${className}`}
    />
  );
} 