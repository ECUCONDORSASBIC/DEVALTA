import { z } from "zod";
export declare const EmailSchema: z.ZodString;
export declare const PhoneSchema: z.ZodString;
export declare const DniSchema: z.ZodString;
export declare const MedicalRecordSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    type: z.ZodEnum<["consultation", "examination", "prescription", "lab_result"]>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    status: z.ZodDefault<z.ZodEnum<["active", "archived", "pending"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "consultation" | "examination" | "prescription" | "lab_result";
    date: string;
    title: string;
    status: "active" | "archived" | "pending";
    id: string;
    patientId: string;
    priority: "medium" | "low" | "high" | "critical";
    description?: string | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    type: "consultation" | "examination" | "prescription" | "lab_result";
    date: string;
    title: string;
    id: string;
    patientId: string;
    status?: "active" | "archived" | "pending" | undefined;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const PrescriptionSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    doctorId: z.ZodString;
    medications: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dosage: z.ZodString;
        frequency: z.ZodString;
        duration: z.ZodString;
        instructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | undefined;
    }, {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | undefined;
    }>, "many">;
    date: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["active", "completed", "cancelled"]>>;
    notes: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    date: string;
    status: "active" | "completed" | "cancelled";
    id: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | undefined;
    }[];
    patientId: string;
    doctorId: string;
    attachments?: string[] | undefined;
    notes?: string | undefined;
}, {
    date: string;
    id: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | undefined;
    }[];
    patientId: string;
    doctorId: string;
    status?: "active" | "completed" | "cancelled" | undefined;
    attachments?: string[] | undefined;
    notes?: string | undefined;
}>;
export declare const AppointmentSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    doctorId: z.ZodString;
    date: z.ZodString;
    duration: z.ZodNumber;
    type: z.ZodEnum<["consultation", "examination", "follow_up", "emergency"]>;
    status: z.ZodEnum<["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]>;
    location: z.ZodOptional<z.ZodString>;
    isTelemedicine: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
    symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    diagnosis: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "consultation" | "examination" | "follow_up" | "emergency";
    date: string;
    status: "completed" | "cancelled" | "scheduled" | "confirmed" | "in_progress" | "no_show";
    id: string;
    patientId: string;
    doctorId: string;
    duration: number;
    isTelemedicine: boolean;
    notes?: string | undefined;
    location?: string | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}, {
    type: "consultation" | "examination" | "follow_up" | "emergency";
    date: string;
    status: "completed" | "cancelled" | "scheduled" | "confirmed" | "in_progress" | "no_show";
    id: string;
    patientId: string;
    doctorId: string;
    duration: number;
    notes?: string | undefined;
    location?: string | undefined;
    isTelemedicine?: boolean | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}>;
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare const validateEmail: (email: string) => ValidationResult;
export declare const validatePhone: (phone: string) => ValidationResult;
export declare const validateDNI: (dni: string) => ValidationResult;
export declare const validateRequired: (value: any, fieldName: string) => ValidationResult;
export declare const validateMedicalRecord: (data: unknown) => z.SafeParseReturnType<{
    type: "consultation" | "examination" | "prescription" | "lab_result";
    date: string;
    title: string;
    id: string;
    patientId: string;
    status?: "active" | "archived" | "pending" | undefined;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    type: "consultation" | "examination" | "prescription" | "lab_result";
    date: string;
    title: string;
    status: "active" | "archived" | "pending";
    id: string;
    patientId: string;
    priority: "medium" | "low" | "high" | "critical";
    description?: string | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const validatePrescription: (data: unknown) => z.SafeParseReturnType<{
    date: string;
    id: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | undefined;
    }[];
    patientId: string;
    doctorId: string;
    status?: "active" | "completed" | "cancelled" | undefined;
    attachments?: string[] | undefined;
    notes?: string | undefined;
}, {
    date: string;
    status: "active" | "completed" | "cancelled";
    id: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | undefined;
    }[];
    patientId: string;
    doctorId: string;
    attachments?: string[] | undefined;
    notes?: string | undefined;
}>;
export declare const validateAppointment: (data: unknown) => z.SafeParseReturnType<{
    type: "consultation" | "examination" | "follow_up" | "emergency";
    date: string;
    status: "completed" | "cancelled" | "scheduled" | "confirmed" | "in_progress" | "no_show";
    id: string;
    patientId: string;
    doctorId: string;
    duration: number;
    notes?: string | undefined;
    location?: string | undefined;
    isTelemedicine?: boolean | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}, {
    type: "consultation" | "examination" | "follow_up" | "emergency";
    date: string;
    status: "completed" | "cancelled" | "scheduled" | "confirmed" | "in_progress" | "no_show";
    id: string;
    patientId: string;
    doctorId: string;
    duration: number;
    isTelemedicine: boolean;
    notes?: string | undefined;
    location?: string | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}>;
export declare const createCustomValidator: <T>(schema: z.ZodSchema<T>) => {
    validate: (data: unknown) => data is T;
    parse: (data: unknown) => T;
    safeParse: (data: unknown) => z.SafeParseReturnType<T, T>;
};
export declare const validateBloodPressure: (systolic: number, diastolic: number) => boolean;
export declare const validateHeartRate: (bpm: number) => boolean;
export declare const validateTemperature: (temp: number) => boolean;
export declare const validateWeight: (weight: number) => boolean;
export declare const validateHeight: (height: number) => boolean;
//# sourceMappingURL=validation.d.ts.map