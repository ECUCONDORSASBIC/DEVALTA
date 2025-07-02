"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar si el componente está en el cliente
 * Útil para evitar errores de hidratación en SSR
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook para manejo seguro de estado con hidratación
 * Retorna un valor inicial hasta que el componente esté hidratado
 */
export function useHydrationSafe<T>(initialValue: T, clientValue: T): T {
  const [value, setValue] = useState<T>(initialValue);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      setValue(clientValue);
    }
  }, [isClient, clientValue]);

  return value;
}

/**
 * Hook para manejo seguro de localStorage
 * Evita errores de SSR al acceder a localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key, isClient]);

  const setValue = (value: T | ((val: T) => T)) => {
    if (!isClient) return;

    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Hook para manejo seguro de sessionStorage
 * Evita errores de SSR al acceder a sessionStorage
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      try {
        const item = window.sessionStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading sessionStorage key "${key}":`, error);
      }
    }
  }, [key, isClient]);

  const setValue = (value: T | ((val: T) => T)) => {
    if (!isClient) return;

    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Hook para manejo seguro de window
 * Retorna null hasta que el componente esté hidratado
 */
export function useWindow() {
  const [windowObj, setWindowObj] = useState<Window | null>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      setWindowObj(window);
    }
  }, [isClient]);

  return windowObj;
}

/**
 * Hook para manejo seguro de document
 * Retorna null hasta que el componente esté hidratado
 */
export function useDocument() {
  const [documentObj, setDocumentObj] = useState<Document | null>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      setDocumentObj(document);
    }
  }, [isClient]);

  return documentObj;
}
