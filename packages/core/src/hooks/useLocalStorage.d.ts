export declare function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void];
export declare function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, () => void];
export declare function useSecureStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, () => void];
export declare function usePatientData<T>(patientId: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void];
export declare function useMedicalRecords(patientId: string): readonly [any[], (value: any[] | ((val: any[]) => any[])) => void];
export declare function usePrescriptions(patientId: string): readonly [any[], (value: any[] | ((val: any[]) => any[])) => void];
export declare function useAppointments(patientId: string): readonly [any[], (value: any[] | ((val: any[]) => any[])) => void];
export declare function useLabResults(patientId: string): readonly [any[], (value: any[] | ((val: any[]) => any[])) => void];
export declare function useUserPreferences<T>(userId: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void];
export declare function useStorageWithTTL<T>(key: string, initialValue: T, ttl?: number): [T | null, (value: T) => void, () => void];
//# sourceMappingURL=useLocalStorage.d.ts.map