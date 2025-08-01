import { z } from "zod";
export * from "./types/medical";
export declare const UserRoleSchema: z.ZodEnum<["admin", "doctor", "patient", "staff"]>;
export declare const VerifyTokenSchema: z.ZodObject<{
    idToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    idToken: string;
}, {
    idToken: string;
}>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["admin", "doctor", "patient", "staff"]>;
    phoneNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    phoneNumber?: string | undefined;
}, {
    email: string;
    password: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    phoneNumber?: string | undefined;
}>;
export declare const UserSchema: z.ZodObject<{
    uid: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["admin", "doctor", "patient", "staff"]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastLoginAt: z.ZodOptional<z.ZodDate>;
    profileComplete: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    uid: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    profileComplete: boolean;
    phone?: string | undefined;
    avatar?: string | undefined;
    lastLoginAt?: Date | undefined;
}, {
    email: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    phone?: string | undefined;
    avatar?: string | undefined;
    isActive?: boolean | undefined;
    lastLoginAt?: Date | undefined;
    profileComplete?: boolean | undefined;
}>;
export declare const CreateUserSchema: z.ZodObject<Omit<{
    uid: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["admin", "doctor", "patient", "staff"]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastLoginAt: z.ZodOptional<z.ZodDate>;
    profileComplete: z.ZodDefault<z.ZodBoolean>;
}, "uid" | "createdAt" | "updatedAt" | "lastLoginAt">, "strip", z.ZodTypeAny, {
    email: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    isActive: boolean;
    profileComplete: boolean;
    phone?: string | undefined;
    avatar?: string | undefined;
}, {
    email: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    avatar?: string | undefined;
    isActive?: boolean | undefined;
    profileComplete?: boolean | undefined;
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "doctor", "patient", "staff"]>>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    avatar: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    profileComplete: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    role?: "patient" | "doctor" | "admin" | "staff" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    isActive?: boolean | undefined;
    profileComplete?: boolean | undefined;
}, {
    email?: string | undefined;
    role?: "patient" | "doctor" | "admin" | "staff" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    isActive?: boolean | undefined;
    profileComplete?: boolean | undefined;
}>;
export declare const SpecialtySchema: z.ZodEnum<["cardiology", "dermatology", "endocrinology", "gastroenterology", "general_practice", "gynecology", "neurology", "oncology", "ophthalmology", "orthopedics", "pediatrics", "psychiatry", "pulmonology", "radiology", "surgery", "urology"]>;
export declare const DoctorProfileSchema: z.ZodObject<{
    uid: z.ZodString;
    licenseNumber: z.ZodString;
    specialties: z.ZodArray<z.ZodEnum<["cardiology", "dermatology", "endocrinology", "gastroenterology", "general_practice", "gynecology", "neurology", "oncology", "ophthalmology", "orthopedics", "pediatrics", "psychiatry", "pulmonology", "radiology", "surgery", "urology"]>, "many">;
    education: z.ZodOptional<z.ZodArray<z.ZodObject<{
        institution: z.ZodString;
        degree: z.ZodString;
        year: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        year: number;
        institution: string;
        degree: string;
    }, {
        year: number;
        institution: string;
        degree: string;
    }>, "many">>;
    experience: z.ZodOptional<z.ZodNumber>;
    bio: z.ZodOptional<z.ZodString>;
    consultationFee: z.ZodOptional<z.ZodNumber>;
    availability: z.ZodOptional<z.ZodObject<{
        monday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tuesday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        wednesday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        thursday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        friday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        saturday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sunday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    }, {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    }>>;
    companyId: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    licenseNumber: string;
    specialties: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[];
    isVerified: boolean;
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
}, {
    licenseNumber: string;
    specialties: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[];
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    isVerified?: boolean | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
}>;
export declare const CreateDoctorProfileSchema: z.ZodObject<Omit<{
    uid: z.ZodString;
    licenseNumber: z.ZodString;
    specialties: z.ZodArray<z.ZodEnum<["cardiology", "dermatology", "endocrinology", "gastroenterology", "general_practice", "gynecology", "neurology", "oncology", "ophthalmology", "orthopedics", "pediatrics", "psychiatry", "pulmonology", "radiology", "surgery", "urology"]>, "many">;
    education: z.ZodOptional<z.ZodArray<z.ZodObject<{
        institution: z.ZodString;
        degree: z.ZodString;
        year: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        year: number;
        institution: string;
        degree: string;
    }, {
        year: number;
        institution: string;
        degree: string;
    }>, "many">>;
    experience: z.ZodOptional<z.ZodNumber>;
    bio: z.ZodOptional<z.ZodString>;
    consultationFee: z.ZodOptional<z.ZodNumber>;
    availability: z.ZodOptional<z.ZodObject<{
        monday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tuesday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        wednesday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        thursday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        friday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        saturday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sunday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    }, {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    }>>;
    companyId: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "uid" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    licenseNumber: string;
    specialties: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[];
    isVerified: boolean;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
}, {
    licenseNumber: string;
    specialties: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[];
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    isVerified?: boolean | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
}>;
export declare const UpdateDoctorProfileSchema: z.ZodObject<{
    licenseNumber: z.ZodOptional<z.ZodString>;
    availability: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        monday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tuesday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        wednesday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        thursday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        friday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        saturday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sunday: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    }, {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    }>>>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodEnum<["cardiology", "dermatology", "endocrinology", "gastroenterology", "general_practice", "gynecology", "neurology", "oncology", "ophthalmology", "orthopedics", "pediatrics", "psychiatry", "pulmonology", "radiology", "surgery", "urology"]>, "many">>;
    experience: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    education: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        institution: z.ZodString;
        degree: z.ZodString;
        year: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        year: number;
        institution: string;
        degree: string;
    }, {
        year: number;
        institution: string;
        degree: string;
    }>, "many">>>;
    isVerified: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    consultationFee: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    companyId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    licenseNumber?: string | undefined;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    isVerified?: boolean | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
}, {
    licenseNumber?: string | undefined;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    isVerified?: boolean | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
}>;
export declare const BloodTypeSchema: z.ZodEnum<["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]>;
export declare const PatientProfileSchema: z.ZodObject<{
    uid: z.ZodString;
    dateOfBirth: z.ZodDate;
    gender: z.ZodEnum<["male", "female", "other"]>;
    bloodType: z.ZodOptional<z.ZodEnum<["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]>>;
    height: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    chronicConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    medications: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dosage: z.ZodString;
        frequency: z.ZodString;
        startDate: z.ZodDate;
        endDate: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }, {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }>, "many">>;
    emergencyContact: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        relationship: string;
    }, {
        name: string;
        phone: string;
        relationship: string;
    }>>;
    insuranceInfo: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        policyNumber: z.ZodString;
        groupNumber: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    }>>;
    companyId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    height?: number | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
}, {
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    height?: number | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
}>;
export declare const CreatePatientProfileSchema: z.ZodObject<Omit<{
    uid: z.ZodString;
    dateOfBirth: z.ZodDate;
    gender: z.ZodEnum<["male", "female", "other"]>;
    bloodType: z.ZodOptional<z.ZodEnum<["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]>>;
    height: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    chronicConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    medications: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dosage: z.ZodString;
        frequency: z.ZodString;
        startDate: z.ZodDate;
        endDate: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }, {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }>, "many">>;
    emergencyContact: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        relationship: string;
    }, {
        name: string;
        phone: string;
        relationship: string;
    }>>;
    insuranceInfo: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        policyNumber: z.ZodString;
        groupNumber: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    }>>;
    companyId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "uid" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    height?: number | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
}, {
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    height?: number | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
}>;
export declare const UpdatePatientProfileSchema: z.ZodObject<{
    height: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    dateOfBirth: z.ZodOptional<z.ZodDate>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    emergencyContact: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        relationship: string;
    }, {
        name: string;
        phone: string;
        relationship: string;
    }>>>;
    allergies: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    medications: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dosage: z.ZodString;
        frequency: z.ZodString;
        startDate: z.ZodDate;
        endDate: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }, {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }>, "many">>>;
    bloodType: z.ZodOptional<z.ZodOptional<z.ZodEnum<["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]>>>;
    companyId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    weight: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    chronicConditions: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    insuranceInfo: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        policyNumber: z.ZodString;
        groupNumber: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    }, {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    height?: number | undefined;
    dateOfBirth?: Date | undefined;
    gender?: "male" | "female" | "other" | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
}, {
    height?: number | undefined;
    dateOfBirth?: Date | undefined;
    gender?: "male" | "female" | "other" | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
}>;
export declare const CompanySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    taxId: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>;
    phone: z.ZodString;
    email: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodEnum<["cardiology", "dermatology", "endocrinology", "gastroenterology", "general_practice", "gynecology", "neurology", "oncology", "ophthalmology", "orthopedics", "pediatrics", "psychiatry", "pulmonology", "radiology", "surgery", "urology"]>, "many">>;
    subscription: z.ZodObject<{
        plan: z.ZodEnum<["basic", "premium", "enterprise"]>;
        status: z.ZodEnum<["active", "inactive", "suspended"]>;
        startDate: z.ZodDate;
        endDate: z.ZodOptional<z.ZodDate>;
        maxUsers: z.ZodNumber;
        maxPatients: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    }, {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    }>;
    settings: z.ZodOptional<z.ZodObject<{
        timeZone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        appointmentDuration: z.ZodDefault<z.ZodNumber>;
        workingHours: z.ZodDefault<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            end: string;
            start: string;
        }, {
            end: string;
            start: string;
        }>>;
        workingDays: z.ZodDefault<z.ZodArray<z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    }, {
        timeZone?: string | undefined;
        language?: string | undefined;
        appointmentDuration?: number | undefined;
        workingHours?: {
            end: string;
            start: string;
        } | undefined;
        workingDays?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    email: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    id: string;
    name: string;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    taxId: string;
    subscription: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    };
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    settings?: {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    } | undefined;
}, {
    email: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    id: string;
    name: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    taxId: string;
    subscription: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    };
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    isActive?: boolean | undefined;
    settings?: {
        timeZone?: string | undefined;
        language?: string | undefined;
        appointmentDuration?: number | undefined;
        workingHours?: {
            end: string;
            start: string;
        } | undefined;
        workingDays?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    } | undefined;
}>;
export declare const CreateCompanySchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    taxId: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>;
    phone: z.ZodString;
    email: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodEnum<["cardiology", "dermatology", "endocrinology", "gastroenterology", "general_practice", "gynecology", "neurology", "oncology", "ophthalmology", "orthopedics", "pediatrics", "psychiatry", "pulmonology", "radiology", "surgery", "urology"]>, "many">>;
    subscription: z.ZodObject<{
        plan: z.ZodEnum<["basic", "premium", "enterprise"]>;
        status: z.ZodEnum<["active", "inactive", "suspended"]>;
        startDate: z.ZodDate;
        endDate: z.ZodOptional<z.ZodDate>;
        maxUsers: z.ZodNumber;
        maxPatients: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    }, {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    }>;
    settings: z.ZodOptional<z.ZodObject<{
        timeZone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        appointmentDuration: z.ZodDefault<z.ZodNumber>;
        workingHours: z.ZodDefault<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            end: string;
            start: string;
        }, {
            end: string;
            start: string;
        }>>;
        workingDays: z.ZodDefault<z.ZodArray<z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    }, {
        timeZone?: string | undefined;
        language?: string | undefined;
        appointmentDuration?: number | undefined;
        workingHours?: {
            end: string;
            start: string;
        } | undefined;
        workingDays?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    }>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    email: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    name: string;
    phone: string;
    isActive: boolean;
    taxId: string;
    subscription: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    };
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    settings?: {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    } | undefined;
}, {
    email: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    name: string;
    phone: string;
    taxId: string;
    subscription: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    };
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    isActive?: boolean | undefined;
    settings?: {
        timeZone?: string | undefined;
        language?: string | undefined;
        appointmentDuration?: number | undefined;
        workingHours?: {
            end: string;
            start: string;
        } | undefined;
        workingDays?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    } | undefined;
}>;
export declare const UpdateCompanySchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>>;
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodEnum<["cardiology", "dermatology", "endocrinology", "gastroenterology", "general_practice", "gynecology", "neurology", "oncology", "ophthalmology", "orthopedics", "pediatrics", "psychiatry", "pulmonology", "radiology", "surgery", "urology"]>, "many">>>;
    logo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    website: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    taxId: z.ZodOptional<z.ZodString>;
    subscription: z.ZodOptional<z.ZodObject<{
        plan: z.ZodEnum<["basic", "premium", "enterprise"]>;
        status: z.ZodEnum<["active", "inactive", "suspended"]>;
        startDate: z.ZodDate;
        endDate: z.ZodOptional<z.ZodDate>;
        maxUsers: z.ZodNumber;
        maxPatients: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    }, {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    }>>;
    settings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        timeZone: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        appointmentDuration: z.ZodDefault<z.ZodNumber>;
        workingHours: z.ZodDefault<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            end: string;
            start: string;
        }, {
            end: string;
            start: string;
        }>>;
        workingDays: z.ZodDefault<z.ZodArray<z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    }, {
        timeZone?: string | undefined;
        language?: string | undefined;
        appointmentDuration?: number | undefined;
        workingHours?: {
            end: string;
            start: string;
        } | undefined;
        workingDays?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    isActive?: boolean | undefined;
    taxId?: string | undefined;
    subscription?: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    } | undefined;
    settings?: {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    } | undefined;
}, {
    email?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    isActive?: boolean | undefined;
    taxId?: string | undefined;
    subscription?: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    } | undefined;
    settings?: {
        timeZone?: string | undefined;
        language?: string | undefined;
        appointmentDuration?: number | undefined;
        workingHours?: {
            end: string;
            start: string;
        } | undefined;
        workingDays?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    } | undefined;
}>;
export declare const AppointmentStatusSchema: z.ZodEnum<["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"]>;
export declare const AppointmentTypeSchema: z.ZodEnum<["consultation", "follow-up", "emergency", "routine", "specialist"]>;
export declare const AppointmentSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    doctorId: z.ZodString;
    date: z.ZodDate;
    duration: z.ZodNumber;
    type: z.ZodEnum<["consultation", "follow-up", "emergency", "routine", "specialist"]>;
    status: z.ZodEnum<["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"]>;
    location: z.ZodOptional<z.ZodString>;
    isTelemedicine: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
    symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    diagnosis: z.ZodOptional<z.ZodString>;
    prescription: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    type: "consultation" | "emergency" | "follow-up" | "routine" | "specialist";
    date: Date;
    status: "completed" | "cancelled" | "scheduled" | "confirmed" | "in-progress" | "no-show";
    id: string;
    patientId: string;
    doctorId: string;
    duration: number;
    isTelemedicine: boolean;
    createdAt: Date;
    updatedAt: Date;
    prescription?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}, {
    type: "consultation" | "emergency" | "follow-up" | "routine" | "specialist";
    date: Date;
    status: "completed" | "cancelled" | "scheduled" | "confirmed" | "in-progress" | "no-show";
    id: string;
    patientId: string;
    doctorId: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    prescription?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    isTelemedicine?: boolean | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}>;
export declare const CreateAppointmentSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    patientId: z.ZodString;
    doctorId: z.ZodString;
    date: z.ZodDate;
    duration: z.ZodNumber;
    type: z.ZodEnum<["consultation", "follow-up", "emergency", "routine", "specialist"]>;
    status: z.ZodEnum<["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"]>;
    location: z.ZodOptional<z.ZodString>;
    isTelemedicine: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
    symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    diagnosis: z.ZodOptional<z.ZodString>;
    prescription: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "status" | "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    type: "consultation" | "emergency" | "follow-up" | "routine" | "specialist";
    date: Date;
    patientId: string;
    doctorId: string;
    duration: number;
    isTelemedicine: boolean;
    prescription?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}, {
    type: "consultation" | "emergency" | "follow-up" | "routine" | "specialist";
    date: Date;
    patientId: string;
    doctorId: string;
    duration: number;
    prescription?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    isTelemedicine?: boolean | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}>;
export declare const UpdateAppointmentSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["consultation", "follow-up", "emergency", "routine", "specialist"]>>;
    date: z.ZodOptional<z.ZodDate>;
    patientId: z.ZodOptional<z.ZodString>;
    prescription: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    doctorId: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isTelemedicine: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    symptoms: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    diagnosis: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: "consultation" | "emergency" | "follow-up" | "routine" | "specialist" | undefined;
    date?: Date | undefined;
    patientId?: string | undefined;
    prescription?: string | undefined;
    doctorId?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    isTelemedicine?: boolean | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}, {
    type?: "consultation" | "emergency" | "follow-up" | "routine" | "specialist" | undefined;
    date?: Date | undefined;
    patientId?: string | undefined;
    prescription?: string | undefined;
    doctorId?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    isTelemedicine?: boolean | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
}>;
export declare const MedicalRecordTypeSchema: z.ZodEnum<["consultation", "diagnosis", "treatment", "lab_result", "imaging", "prescription", "vaccination", "surgery", "allergy", "family_history"]>;
export declare const PrioritySchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export declare const MedicalRecordSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    doctorId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["consultation", "diagnosis", "treatment", "lab_result", "imaging", "prescription", "vaccination", "surgery", "allergy", "family_history"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    status: z.ZodDefault<z.ZodEnum<["active", "archived", "pending"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    type: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history";
    title: string;
    status: "active" | "archived" | "pending";
    id: string;
    patientId: string;
    doctorId: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    type: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history";
    title: string;
    id: string;
    patientId: string;
    doctorId: string;
    createdAt: Date;
    updatedAt: Date;
    status?: "active" | "archived" | "pending" | undefined;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const CreateMedicalRecordSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    patientId: z.ZodString;
    doctorId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["consultation", "diagnosis", "treatment", "lab_result", "imaging", "prescription", "vaccination", "surgery", "allergy", "family_history"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    status: z.ZodDefault<z.ZodEnum<["active", "archived", "pending"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "status" | "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    type: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history";
    title: string;
    patientId: string;
    doctorId: string;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    type: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history";
    title: string;
    patientId: string;
    doctorId: string;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const UpdateMedicalRecordSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["consultation", "diagnosis", "treatment", "lab_result", "imaging", "prescription", "vaccination", "surgery", "allergy", "family_history"]>>;
    title: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>>;
    attachments: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    doctorId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history" | undefined;
    title?: string | undefined;
    patientId?: string | undefined;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
    doctorId?: string | undefined;
}, {
    type?: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history" | undefined;
    title?: string | undefined;
    patientId?: string | undefined;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
    doctorId?: string | undefined;
}>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: any;
    }, {
        code: string;
        message: string;
        details?: any;
    }>>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    timestamp: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
    data?: any;
}, {
    success: boolean;
    timestamp: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | undefined;
    data?: any;
}>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Specialty = z.infer<typeof SpecialtySchema>;
export type DoctorProfile = z.infer<typeof DoctorProfileSchema>;
export type CreateDoctorProfile = z.infer<typeof CreateDoctorProfileSchema>;
export type UpdateDoctorProfile = z.infer<typeof UpdateDoctorProfileSchema>;
export type BloodType = z.infer<typeof BloodTypeSchema>;
export type PatientProfile = z.infer<typeof PatientProfileSchema>;
export type CreatePatientProfile = z.infer<typeof CreatePatientProfileSchema>;
export type UpdatePatientProfile = z.infer<typeof UpdatePatientProfileSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type CreateCompany = z.infer<typeof CreateCompanySchema>;
export type UpdateCompany = z.infer<typeof UpdateCompanySchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type AppointmentType = z.infer<typeof AppointmentTypeSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export type CreateMedicalRecord = z.infer<typeof CreateMedicalRecordSchema>;
export type UpdateMedicalRecord = z.infer<typeof UpdateMedicalRecordSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export declare const validateUser: (data: unknown) => {
    email: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    uid: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    profileComplete: boolean;
    phone?: string | undefined;
    avatar?: string | undefined;
    lastLoginAt?: Date | undefined;
};
export declare const validateCreateUser: (data: unknown) => {
    email: string;
    role: "patient" | "doctor" | "admin" | "staff";
    firstName: string;
    lastName: string;
    isActive: boolean;
    profileComplete: boolean;
    phone?: string | undefined;
    avatar?: string | undefined;
};
export declare const validateUpdateUser: (data: unknown) => {
    email?: string | undefined;
    role?: "patient" | "doctor" | "admin" | "staff" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    isActive?: boolean | undefined;
    profileComplete?: boolean | undefined;
};
export declare const validateDoctorProfile: (data: unknown) => {
    licenseNumber: string;
    specialties: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[];
    isVerified: boolean;
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
};
export declare const validateCreateDoctorProfile: (data: unknown) => {
    licenseNumber: string;
    specialties: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[];
    isVerified: boolean;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
};
export declare const validateUpdateDoctorProfile: (data: unknown) => {
    licenseNumber?: string | undefined;
    availability?: {
        monday?: string[] | undefined;
        tuesday?: string[] | undefined;
        wednesday?: string[] | undefined;
        thursday?: string[] | undefined;
        friday?: string[] | undefined;
        saturday?: string[] | undefined;
        sunday?: string[] | undefined;
    } | undefined;
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    experience?: number | undefined;
    education?: {
        year: number;
        institution: string;
        degree: string;
    }[] | undefined;
    isVerified?: boolean | undefined;
    bio?: string | undefined;
    consultationFee?: number | undefined;
    companyId?: string | undefined;
};
export declare const validatePatientProfile: (data: unknown) => {
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    uid: string;
    createdAt: Date;
    updatedAt: Date;
    height?: number | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
};
export declare const validateCreatePatientProfile: (data: unknown) => {
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    height?: number | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
};
export declare const validateUpdatePatientProfile: (data: unknown) => {
    height?: number | undefined;
    dateOfBirth?: Date | undefined;
    gender?: "male" | "female" | "other" | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    } | undefined;
    allergies?: string[] | undefined;
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate?: Date | undefined;
    }[] | undefined;
    bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | undefined;
    companyId?: string | undefined;
    weight?: number | undefined;
    chronicConditions?: string[] | undefined;
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
        groupNumber?: string | undefined;
    } | undefined;
};
export declare const validateCompany: (data: unknown) => {
    email: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    id: string;
    name: string;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    taxId: string;
    subscription: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    };
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    settings?: {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    } | undefined;
};
export declare const validateCreateCompany: (data: unknown) => {
    email: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    name: string;
    phone: string;
    isActive: boolean;
    taxId: string;
    subscription: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    };
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    settings?: {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    } | undefined;
};
export declare const validateUpdateCompany: (data: unknown) => {
    email?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    specialties?: ("cardiology" | "dermatology" | "endocrinology" | "gastroenterology" | "gynecology" | "neurology" | "ophthalmology" | "orthopedics" | "pediatrics" | "psychiatry" | "radiology" | "urology" | "surgery" | "general_practice" | "oncology" | "pulmonology")[] | undefined;
    logo?: string | undefined;
    website?: string | undefined;
    isActive?: boolean | undefined;
    taxId?: string | undefined;
    subscription?: {
        status: "active" | "inactive" | "suspended";
        startDate: Date;
        plan: "basic" | "premium" | "enterprise";
        maxUsers: number;
        maxPatients: number;
        endDate?: Date | undefined;
    } | undefined;
    settings?: {
        timeZone: string;
        language: string;
        appointmentDuration: number;
        workingHours: {
            end: string;
            start: string;
        };
        workingDays: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
    } | undefined;
};
export declare const validateAppointment: (data: unknown) => {
    type: "consultation" | "emergency" | "follow-up" | "routine" | "specialist";
    date: Date;
    status: "completed" | "cancelled" | "scheduled" | "confirmed" | "in-progress" | "no-show";
    id: string;
    patientId: string;
    doctorId: string;
    duration: number;
    isTelemedicine: boolean;
    createdAt: Date;
    updatedAt: Date;
    prescription?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
};
export declare const validateCreateAppointment: (data: unknown) => {
    type: "consultation" | "emergency" | "follow-up" | "routine" | "specialist";
    date: Date;
    patientId: string;
    doctorId: string;
    duration: number;
    isTelemedicine: boolean;
    prescription?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
};
export declare const validateUpdateAppointment: (data: unknown) => {
    type?: "consultation" | "emergency" | "follow-up" | "routine" | "specialist" | undefined;
    date?: Date | undefined;
    patientId?: string | undefined;
    prescription?: string | undefined;
    doctorId?: string | undefined;
    duration?: number | undefined;
    notes?: string | undefined;
    location?: string | undefined;
    isTelemedicine?: boolean | undefined;
    symptoms?: string[] | undefined;
    diagnosis?: string | undefined;
};
export declare const validateMedicalRecord: (data: unknown) => {
    type: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history";
    title: string;
    status: "active" | "archived" | "pending";
    id: string;
    patientId: string;
    doctorId: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
};
export declare const validateCreateMedicalRecord: (data: unknown) => {
    type: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history";
    title: string;
    patientId: string;
    doctorId: string;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
};
export declare const validateUpdateMedicalRecord: (data: unknown) => {
    type?: "consultation" | "prescription" | "lab_result" | "diagnosis" | "treatment" | "imaging" | "vaccination" | "surgery" | "allergy" | "family_history" | undefined;
    title?: string | undefined;
    patientId?: string | undefined;
    description?: string | undefined;
    priority?: "medium" | "low" | "high" | "critical" | undefined;
    attachments?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
    doctorId?: string | undefined;
};
export * from "./types/base";
export * from "./types/api";
//# sourceMappingURL=index.d.ts.map