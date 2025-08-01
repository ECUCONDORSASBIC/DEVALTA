'use client';

import React from 'react';

interface NavigationProps {
  selectedView: string;
  onViewChange: (view: string) => void;
}

const navigationItems = [
  { id: 'overview', label: 'Resumen', icon: '📊' },
  { id: 'doctors', label: 'Personal Médico', icon: '👨‍⚕️' },
  { id: 'marketplace', label: 'Marketplace', icon: '💼' },
  { id: 'appointments', label: 'Citas', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📈' }
];

export default function Navigation({ selectedView, onViewChange }: NavigationProps) {
  return (
    <div className="bg-white shadow-sm border-b border-sky-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                selectedView === item.id
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-sky-600 hover:border-sky-300'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}