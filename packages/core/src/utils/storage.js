export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error("Error saving to localStorage:", error);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error("Error removing from localStorage:", error);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        }
        catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    },
};
export const sessionStorage = {
    get: (key) => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        catch {
            return null;
        }
    },
    set: (key, value) => {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error("Error saving to sessionStorage:", error);
        }
    },
    remove: (key) => {
        try {
            window.sessionStorage.removeItem(key);
        }
        catch (error) {
            console.error("Error removing from sessionStorage:", error);
        }
    },
    clear: () => {
        try {
            window.sessionStorage.clear();
        }
        catch (error) {
            console.error("Error clearing sessionStorage:", error);
        }
    },
};
export const MEDICAL_STORAGE_KEYS = {
    USER_TOKEN: "altamedica_user_token",
    USER_DATA: "altamedica_user_data",
    PATIENT_DATA: "altamedica_patient_data",
    DOCTOR_DATA: "altamedica_doctor_data",
    APPOINTMENTS: "altamedica_appointments",
    PRESCRIPTIONS: "altamedica_prescriptions",
    MEDICAL_RECORDS: "altamedica_medical_records",
    FAVORITES: "altamedica_favorites",
    SETTINGS: "altamedica_settings",
};
export const medicalStorage = {
    setPatientData: (patientId, data) => {
        storage.set(`patient_${patientId}`, data);
    },
    getPatientData: (patientId) => {
        return storage.get(`patient_${patientId}`);
    },
    setMedicalRecords: (patientId, records) => {
        storage.set(`medical_records_${patientId}`, records);
    },
    getMedicalRecords: (patientId) => {
        return storage.get(`medical_records_${patientId}`) || [];
    },
    setPrescriptions: (patientId, prescriptions) => {
        storage.set(`prescriptions_${patientId}`, prescriptions);
    },
    getPrescriptions: (patientId) => {
        return storage.get(`prescriptions_${patientId}`) || [];
    },
    setAppointments: (patientId, appointments) => {
        storage.set(`appointments_${patientId}`, appointments);
    },
    getAppointments: (patientId) => {
        return storage.get(`appointments_${patientId}`) || [];
    },
    setLabResults: (patientId, results) => {
        storage.set(`lab_results_${patientId}`, results);
    },
    getLabResults: (patientId) => {
        return storage.get(`lab_results_${patientId}`) || [];
    },
    setUserPreferences: (userId, preferences) => {
        storage.set(`user_preferences_${userId}`, preferences);
    },
    getUserPreferences: (userId) => {
        return storage.get(`user_preferences_${userId}`);
    },
    clearPatientData: (patientId) => {
        storage.remove(`patient_${patientId}`);
        storage.remove(`medical_records_${patientId}`);
        storage.remove(`prescriptions_${patientId}`);
        storage.remove(`appointments_${patientId}`);
        storage.remove(`lab_results_${patientId}`);
    },
};
export const cache = {
    private: new Map(),
    set: (key, data, ttl = 300000) => {
        cache.private.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    },
    get: (key) => {
        const item = cache.private.get(key);
        if (!item)
            return null;
        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            cache.private.delete(key);
            return null;
        }
        return item.data;
    },
    has: (key) => {
        const item = cache.private.get(key);
        if (!item)
            return false;
        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            cache.private.delete(key);
            return false;
        }
        return true;
    },
    delete: (key) => {
        return cache.private.delete(key);
    },
    clear: () => {
        cache.private.clear();
    },
    cleanup: () => {
        const now = Date.now();
        for (const [key, item] of cache.private.entries()) {
            if (now - item.timestamp > item.ttl) {
                cache.private.delete(key);
            }
        }
    },
};
export const secureStorage = {
    encrypt: (data) => {
        if (typeof window === "undefined")
            return data;
        try {
            return btoa(encodeURIComponent(data));
        }
        catch {
            return data;
        }
    },
    decrypt: (data) => {
        if (typeof window === "undefined")
            return data;
        try {
            return decodeURIComponent(atob(data));
        }
        catch {
            return data;
        }
    },
    setSecure: (key, value) => {
        const encrypted = secureStorage.encrypt(JSON.stringify(value));
        storage.set(`secure_${key}`, encrypted);
    },
    getSecure: (key, defaultValue) => {
        try {
            const encrypted = storage.get(`secure_${key}`);
            if (!encrypted)
                return defaultValue || null;
            const decrypted = secureStorage.decrypt(encrypted);
            return JSON.parse(decrypted);
        }
        catch {
            return defaultValue || null;
        }
    },
    removeSecure: (key) => {
        storage.remove(`secure_${key}`);
    },
};
export const createStorageEvent = (key, value, type = "local") => {
    return new CustomEvent("storage-change", {
        detail: {
            key,
            value,
            type,
            timestamp: Date.now(),
        },
    });
};
export const listenToStorageChanges = (callback) => {
    if (typeof window !== "undefined") {
        window.addEventListener("storage-change", callback);
    }
};
export const removeStorageListener = (callback) => {
    if (typeof window !== "undefined") {
        window.removeEventListener("storage-change", callback);
    }
};
//# sourceMappingURL=storage.js.map