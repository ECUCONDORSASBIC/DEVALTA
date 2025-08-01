import { useState, useEffect, useCallback } from "react";
import { storage } from "../utils/storage";

// ==================== USE LOCAL STORAGE HOOK ====================

/**
 * Hook for managing localStorage with React state
 */

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// ==================== USE SESSION STORAGE HOOK ====================

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get from session storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.get(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to session storage
        sessionStorage.set(key, valueToStore);
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from sessionStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      sessionStorage.remove(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ==================== USE SECURE STORAGE HOOK ====================

export function useSecureStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.get(`secure_${key}`);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading secure storage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        storage.set(`secure_${key}`, valueToStore);
      } catch (error) {
        console.error(`Error setting secure storage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      storage.remove(`secure_${key}`);
    } catch (error) {
      console.error(`Error removing secure storage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ==================== USE MEDICAL STORAGE HOOKS ====================

export function usePatientData<T>(patientId: string, initialValue: T) {
  return useLocalStorage<T>(`patient_${patientId}`, initialValue);
}

export function useMedicalRecords(patientId: string) {
  return useLocalStorage<any[]>(`medical_records_${patientId}`, []);
}

export function usePrescriptions(patientId: string) {
  return useLocalStorage<any[]>(`prescriptions_${patientId}`, []);
}

export function useAppointments(patientId: string) {
  return useLocalStorage<any[]>(`appointments_${patientId}`, []);
}

export function useLabResults(patientId: string) {
  return useLocalStorage<any[]>(`lab_results_${patientId}`, []);
}

export function useUserPreferences<T>(userId: string, initialValue: T) {
  return useLocalStorage<T>(`user_preferences_${userId}`, initialValue);
}

// ==================== USE STORAGE WITH TTL ====================

export function useStorageWithTTL<T>(
  key: string,
  initialValue: T,
  ttl: number = 300000 // 5 minutes default
): [T | null, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      const item = storage.get(key) as { data: T; timestamp: number } | null;
      if (!item) return null;

      const now = Date.now();
      if (now - item.timestamp > ttl) {
        storage.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error);
      return null;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        storage.set(key, {
          data: value,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error(`Error setting storage key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(null);
      storage.remove(key);
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}
