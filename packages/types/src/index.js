import { z } from "zod";
export * from "./types/medical";
export const UserRoleSchema = z.enum(["admin", "doctor", "patient", "staff"]);
export const VerifyTokenSchema = z.object({
    idToken: z.string().min(1, "El token es requerido"),
});
export const RegisterSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    firstName: z.string().min(1, "Nombre es requerido"),
    lastName: z.string().min(1, "Apellido es requerido"),
    role: UserRoleSchema,
    phoneNumber: z.string().optional(),
});
export const UserSchema = z.object({
    uid: z.string().min(1, "UID es requerido"),
    email: z.string().email("Email inválido"),
    firstName: z.string().min(1, "Nombre es requerido"),
    lastName: z.string().min(1, "Apellido es requerido"),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
    role: UserRoleSchema,
    isActive: z.boolean().default(true),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastLoginAt: z.date().optional(),
    profileComplete: z.boolean().default(false),
});
export const CreateUserSchema = UserSchema.omit({
    uid: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
});
export const UpdateUserSchema = CreateUserSchema.partial();
export const SpecialtySchema = z.enum([
    "cardiology",
    "dermatology",
    "endocrinology",
    "gastroenterology",
    "general_practice",
    "gynecology",
    "neurology",
    "oncology",
    "ophthalmology",
    "orthopedics",
    "pediatrics",
    "psychiatry",
    "pulmonology",
    "radiology",
    "surgery",
    "urology",
]);
export const DoctorProfileSchema = z.object({
    uid: z.string().min(1, "UID es requerido"),
    licenseNumber: z.string().min(1, "Número de licencia es requerido"),
    specialties: z
        .array(SpecialtySchema)
        .min(1, "Al menos una especialidad es requerida"),
    education: z
        .array(z.object({
        institution: z.string().min(1, "Institución es requerida"),
        degree: z.string().min(1, "Título es requerido"),
        year: z.number().int().min(1950).max(new Date().getFullYear()),
    }))
        .optional(),
    experience: z.number().int().min(0).optional(),
    bio: z.string().optional(),
    consultationFee: z.number().min(0).optional(),
    availability: z
        .object({
        monday: z.array(z.string()).optional(),
        tuesday: z.array(z.string()).optional(),
        wednesday: z.array(z.string()).optional(),
        thursday: z.array(z.string()).optional(),
        friday: z.array(z.string()).optional(),
        saturday: z.array(z.string()).optional(),
        sunday: z.array(z.string()).optional(),
    })
        .optional(),
    companyId: z.string().optional(),
    isVerified: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const CreateDoctorProfileSchema = DoctorProfileSchema.omit({
    uid: true,
    createdAt: true,
    updatedAt: true,
});
export const UpdateDoctorProfileSchema = CreateDoctorProfileSchema.partial();
export const BloodTypeSchema = z.enum([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
]);
export const PatientProfileSchema = z.object({
    uid: z.string().min(1, "UID es requerido"),
    dateOfBirth: z.date(),
    gender: z.enum(["male", "female", "other"]),
    bloodType: BloodTypeSchema.optional(),
    height: z.number().min(0).optional(),
    weight: z.number().min(0).optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    medications: z
        .array(z.object({
        name: z.string().min(1, "Nombre del medicamento es requerido"),
        dosage: z.string().min(1, "Dosis es requerida"),
        frequency: z.string().min(1, "Frecuencia es requerida"),
        startDate: z.date(),
        endDate: z.date().optional(),
    }))
        .optional(),
    emergencyContact: z
        .object({
        name: z.string().min(1, "Nombre del contacto es requerido"),
        relationship: z.string().min(1, "Relación es requerida"),
        phone: z.string().min(1, "Teléfono es requerido"),
    })
        .optional(),
    insuranceInfo: z
        .object({
        provider: z.string().min(1, "Proveedor es requerido"),
        policyNumber: z.string().min(1, "Número de póliza es requerido"),
        groupNumber: z.string().optional(),
    })
        .optional(),
    companyId: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const CreatePatientProfileSchema = PatientProfileSchema.omit({
    uid: true,
    createdAt: true,
    updatedAt: true,
});
export const UpdatePatientProfileSchema = CreatePatientProfileSchema.partial();
export const CompanySchema = z.object({
    id: z.string().min(1, "ID es requerido"),
    name: z.string().min(1, "Nombre de la empresa es requerido"),
    taxId: z.string().min(1, "NIT/RUT es requerido"),
    address: z.object({
        street: z.string().min(1, "Dirección es requerida"),
        city: z.string().min(1, "Ciudad es requerida"),
        state: z.string().min(1, "Estado/Provincia es requerido"),
        zipCode: z.string().min(1, "Código postal es requerido"),
        country: z.string().min(1, "País es requerido"),
    }),
    phone: z.string().min(1, "Teléfono es requerido"),
    email: z.string().email("Email inválido"),
    website: z.string().url().optional(),
    logo: z.string().url().optional(),
    specialties: z.array(SpecialtySchema).optional(),
    subscription: z.object({
        plan: z.enum(["basic", "premium", "enterprise"]),
        status: z.enum(["active", "inactive", "suspended"]),
        startDate: z.date(),
        endDate: z.date().optional(),
        maxUsers: z.number().int().min(1),
        maxPatients: z.number().int().min(1),
    }),
    settings: z
        .object({
        timeZone: z.string().default("America/Bogota"),
        language: z.string().default("es"),
        appointmentDuration: z.number().int().min(15).max(240).default(30),
        workingHours: z
            .object({
            start: z
                .string()
                .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
            end: z
                .string()
                .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
        })
            .default({ start: "08:00", end: "18:00" }),
        workingDays: z
            .array(z.enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ]))
            .default(["monday", "tuesday", "wednesday", "thursday", "friday"]),
    })
        .optional(),
    isActive: z.boolean().default(true),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const CreateCompanySchema = CompanySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const UpdateCompanySchema = CreateCompanySchema.partial();
export const AppointmentStatusSchema = z.enum([
    "scheduled",
    "confirmed",
    "in-progress",
    "completed",
    "cancelled",
    "no-show",
]);
export const AppointmentTypeSchema = z.enum([
    "consultation",
    "follow-up",
    "emergency",
    "routine",
    "specialist",
]);
export const AppointmentSchema = z.object({
    id: z.string().min(1, "ID es requerido"),
    patientId: z.string().min(1, "ID del paciente es requerido"),
    doctorId: z.string().min(1, "ID del doctor es requerido"),
    date: z.date(),
    duration: z.number().int().min(15).max(240),
    type: AppointmentTypeSchema,
    status: AppointmentStatusSchema,
    location: z.string().optional(),
    isTelemedicine: z.boolean().default(false),
    notes: z.string().optional(),
    symptoms: z.array(z.string()).optional(),
    diagnosis: z.string().optional(),
    prescription: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const CreateAppointmentSchema = AppointmentSchema.omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
});
export const UpdateAppointmentSchema = CreateAppointmentSchema.partial();
export const MedicalRecordTypeSchema = z.enum([
    "consultation",
    "diagnosis",
    "treatment",
    "lab_result",
    "imaging",
    "prescription",
    "vaccination",
    "surgery",
    "allergy",
    "family_history",
]);
export const PrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export const MedicalRecordSchema = z.object({
    id: z.string().min(1, "ID es requerido"),
    patientId: z.string().min(1, "ID del paciente es requerido"),
    doctorId: z.string().min(1, "ID del doctor es requerido"),
    title: z.string().min(1, "Título es requerido"),
    description: z.string().optional(),
    type: MedicalRecordTypeSchema,
    priority: PrioritySchema.optional(),
    status: z.enum(["active", "archived", "pending"]).default("active"),
    attachments: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const CreateMedicalRecordSchema = MedicalRecordSchema.omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
});
export const UpdateMedicalRecordSchema = CreateMedicalRecordSchema.partial();
export const ApiResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z
        .object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
    })
        .optional(),
    timestamp: z.string(),
});
export const validateUser = (data) => UserSchema.parse(data);
export const validateCreateUser = (data) => CreateUserSchema.parse(data);
export const validateUpdateUser = (data) => UpdateUserSchema.parse(data);
export const validateDoctorProfile = (data) => DoctorProfileSchema.parse(data);
export const validateCreateDoctorProfile = (data) => CreateDoctorProfileSchema.parse(data);
export const validateUpdateDoctorProfile = (data) => UpdateDoctorProfileSchema.parse(data);
export const validatePatientProfile = (data) => PatientProfileSchema.parse(data);
export const validateCreatePatientProfile = (data) => CreatePatientProfileSchema.parse(data);
export const validateUpdatePatientProfile = (data) => UpdatePatientProfileSchema.parse(data);
export const validateCompany = (data) => CompanySchema.parse(data);
export const validateCreateCompany = (data) => CreateCompanySchema.parse(data);
export const validateUpdateCompany = (data) => UpdateCompanySchema.parse(data);
export const validateAppointment = (data) => AppointmentSchema.parse(data);
export const validateCreateAppointment = (data) => CreateAppointmentSchema.parse(data);
export const validateUpdateAppointment = (data) => UpdateAppointmentSchema.parse(data);
export const validateMedicalRecord = (data) => MedicalRecordSchema.parse(data);
export const validateCreateMedicalRecord = (data) => CreateMedicalRecordSchema.parse(data);
export const validateUpdateMedicalRecord = (data) => UpdateMedicalRecordSchema.parse(data);
export * from "./types/base";
export * from "./types/api";
//# sourceMappingURL=index.js.map