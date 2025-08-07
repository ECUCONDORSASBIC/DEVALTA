'use client'

import { cn } from '@altamedica/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn(
      "bg-gray-50 border-t border-gray-200 px-4 py-3",
      "flex items-center justify-between",
      "text-sm text-gray-600",
      "z-content",
      className
    )}>
      <div className="flex items-center space-x-4">
        <span>© 2024 ALTAMEDICA</span>
        <div className="hidden sm:flex items-center space-x-2">
          <span>•</span>
          <span>Portal Médico Inteligente</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-xs">Versión:</span>
          <span className="text-xs font-mono bg-primary-100 text-primary-800 px-2 py-1 rounded">
            1.0.0
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs">Estado:</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs">Conectado</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
