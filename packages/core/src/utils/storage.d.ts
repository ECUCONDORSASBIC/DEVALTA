export declare const storage: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
    clear: () => void;
};
export declare const sessionStorage: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
    clear: () => void;
};
export declare const MEDICAL_STORAGE_KEYS: {
    readonly USER_TOKEN: "altamedica_user_token";
    readonly USER_DATA: "altamedica_user_data";
    readonly PATIENT_DATA: "altamedica_patient_data";
    readonly DOCTOR_DATA: "altamedica_doctor_data";
    readonly APPOINTMENTS: "altamedica_appointments";
    readonly PRESCRIPTIONS: "altamedica_prescriptions";
    readonly MEDICAL_RECORDS: "altamedica_medical_records";
    readonly FAVORITES: "altamedica_favorites";
    readonly SETTINGS: "altamedica_settings";
};
export declare const medicalStorage: {
    setPatientData: (patientId: string, data: any) => void;
    getPatientData: <T>(patientId: string) => T | null;
    setMedicalRecords: (patientId: string, records: any[]) => void;
    getMedicalRecords: (patientId: string) => any[];
    setPrescriptions: (patientId: string, prescriptions: any[]) => void;
    getPrescriptions: (patientId: string) => any[];
    setAppointments: (patientId: string, appointments: any[]) => void;
    getAppointments: (patientId: string) => any[];
    setLabResults: (patientId: string, results: any[]) => void;
    getLabResults: (patientId: string) => any[];
    setUserPreferences: (userId: string, preferences: any) => void;
    getUserPreferences: <T>(userId: string) => T | null;
    clearPatientData: (patientId: string) => void;
};
export declare const cache: {
    private: Map<string, {
        data: any;
        timestamp: number;
        ttl: number;
    }>;
    set: (key: string, data: any, ttl?: number) => void;
    get: <T>(key: string) => T | null;
    has: (key: string) => boolean;
    delete: (key: string) => boolean;
    clear: () => void;
    cleanup: () => void;
};
export declare const secureStorage: {
    encrypt: (data: string) => string;
    decrypt: (data: string) => string;
    setSecure: (key: string, value: any) => void;
    getSecure: <T>(key: string, defaultValue?: T) => T | null;
    removeSecure: (key: string) => void;
};
export declare const createStorageEvent: (key: string, value: any, type?: "local" | "session") => CustomEvent;
export declare const listenToStorageChanges: (callback: (event: CustomEvent) => void) => void;
export declare const removeStorageListener: (callback: (event: CustomEvent) => void) => void;
//# sourceMappingURL=storage.d.ts.map