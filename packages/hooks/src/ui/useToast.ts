/**
 * @fileoverview Hook básico para toasts
 */

import { useCallback } from 'react';
import { ToastOptions } from './types';

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // Implementación básica para compilar
    console.log('Toast:', options);
  }, []);

  return toast;
}