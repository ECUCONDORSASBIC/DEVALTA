import { useState, useCallback } from "react";
import { storage } from "../utils/storage";
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        }
        catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };
    return [storedValue, setValue];
}
export function useSessionStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = sessionStorage.get(key);
            return item !== null ? item : initialValue;
        }
        catch (error) {
            console.error(`Error reading sessionStorage key "${key}":`, error);
            return initialValue;
        }
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            sessionStorage.set(key, valueToStore);
        }
        catch (error) {
            console.error(`Error setting sessionStorage key "${key}":`, error);
        }
    }, [key, storedValue]);
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            sessionStorage.remove(key);
        }
        catch (error) {
            console.error(`Error removing sessionStorage key "${key}":`, error);
        }
    }, [key, initialValue]);
    return [storedValue, setValue, removeValue];
}
export function useSecureStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = storage.get(`secure_${key}`);
            return item !== null ? item : initialValue;
        }
        catch (error) {
            console.error(`Error reading secure storage key "${key}":`, error);
            return initialValue;
        }
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            storage.set(`secure_${key}`, valueToStore);
        }
        catch (error) {
            console.error(`Error setting secure storage key "${key}":`, error);
        }
    }, [key, storedValue]);
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            storage.remove(`secure_${key}`);
        }
        catch (error) {
            console.error(`Error removing secure storage key "${key}":`, error);
        }
    }, [key, initialValue]);
    return [storedValue, setValue, removeValue];
}
export function usePatientData(patientId, initialValue) {
    return useLocalStorage(`patient_${patientId}`, initialValue);
}
export function useMedicalRecords(patientId) {
    return useLocalStorage(`medical_records_${patientId}`, []);
}
export function usePrescriptions(patientId) {
    return useLocalStorage(`prescriptions_${patientId}`, []);
}
export function useAppointments(patientId) {
    return useLocalStorage(`appointments_${patientId}`, []);
}
export function useLabResults(patientId) {
    return useLocalStorage(`lab_results_${patientId}`, []);
}
export function useUserPreferences(userId, initialValue) {
    return useLocalStorage(`user_preferences_${userId}`, initialValue);
}
export function useStorageWithTTL(key, initialValue, ttl = 300000) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = storage.get(key);
            if (!item)
                return null;
            const now = Date.now();
            if (now - item.timestamp > ttl) {
                storage.remove(key);
                return null;
            }
            return item.data;
        }
        catch (error) {
            console.error(`Error reading storage key "${key}":`, error);
            return null;
        }
    });
    const setValue = useCallback((value) => {
        try {
            setStoredValue(value);
            storage.set(key, {
                data: value,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            console.error(`Error setting storage key "${key}":`, error);
        }
    }, [key]);
    const removeValue = useCallback(() => {
        try {
            setStoredValue(null);
            storage.remove(key);
        }
        catch (error) {
            console.error(`Error removing storage key "${key}":`, error);
        }
    }, [key]);
    return [storedValue, setValue, removeValue];
}
//# sourceMappingURL=useLocalStorage.js.map