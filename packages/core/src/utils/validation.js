import { z } from "zod";
export const EmailSchema = z.string().email("Email inválido");
export const PhoneSchema = z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Teléfono inválido");
export const DniSchema = z
    .string()
    .regex(/^\d{8}$/, "DNI debe tener 8 dígitos");
export const MedicalRecordSchema = z.object({
    id: z.string(),
    patientId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    type: z.enum(["consultation", "examination", "prescription", "lab_result"]),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    status: z.enum(["active", "archived", "pending"]).default("active"),
    attachments: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
});
export const PrescriptionSchema = z.object({
    id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    medications: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string(),
        instructions: z.string().optional(),
    })),
    date: z.string(),
    status: z.enum(["active", "completed", "cancelled"]).default("active"),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional(),
});
export const AppointmentSchema = z.object({
    id: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    date: z.string(),
    duration: z.number().min(15).max(480),
    type: z.enum(["consultation", "examination", "follow_up", "emergency"]),
    status: z.enum([
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
    ]),
    location: z.string().optional(),
    isTelemedicine: z.boolean().default(false),
    notes: z.string().optional(),
    symptoms: z.array(z.string()).optional(),
    diagnosis: z.string().optional(),
});
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return {
        isValid,
        errors: isValid ? [] : ["Email inválido"],
    };
};
export const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    const isValid = phoneRegex.test(phone);
    return {
        isValid,
        errors: isValid ? [] : ["Número de teléfono inválido"],
    };
};
export const validateDNI = (dni) => {
    const dniRegex = /^\d{8}$/;
    const isValid = dniRegex.test(dni);
    return {
        isValid,
        errors: isValid ? [] : ["DNI debe tener 8 dígitos"],
    };
};
export const validateRequired = (value, fieldName) => {
    const isValid = value !== null && value !== undefined && value !== "";
    return {
        isValid,
        errors: isValid ? [] : [`${fieldName} es requerido`],
    };
};
export const validateMedicalRecord = (data) => {
    return MedicalRecordSchema.safeParse(data);
};
export const validatePrescription = (data) => {
    return PrescriptionSchema.safeParse(data);
};
export const validateAppointment = (data) => {
    return AppointmentSchema.safeParse(data);
};
export const createCustomValidator = (schema) => {
    return {
        validate: (data) => {
            return schema.safeParse(data).success;
        },
        parse: (data) => {
            return schema.parse(data);
        },
        safeParse: (data) => {
            return schema.safeParse(data);
        },
    };
};
export const validateBloodPressure = (systolic, diastolic) => {
    return (systolic >= 70 && systolic <= 200 && diastolic >= 40 && diastolic <= 130);
};
export const validateHeartRate = (bpm) => {
    return bpm >= 40 && bpm <= 200;
};
export const validateTemperature = (temp) => {
    return temp >= 35 && temp <= 42;
};
export const validateWeight = (weight) => {
    return weight >= 0.5 && weight <= 500;
};
export const validateHeight = (height) => {
    return height >= 30 && height <= 250;
};
//# sourceMappingURL=validation.js.map