/**
 * @fileoverview Hook básico para clipboard
 */

import { useState, useCallback } from 'react';

export function useClipboard() {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  return { hasCopied, onCopy };
}