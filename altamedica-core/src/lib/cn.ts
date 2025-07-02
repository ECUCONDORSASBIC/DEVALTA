// Utilidad para combinar clases CSS - Altamedica
// Función cn optimizada para el sistema médico

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
