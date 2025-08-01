export declare const MEDICAL_SPECIALTIES: readonly ["Cardiología", "Dermatología", "Endocrinología", "Gastroenterología", "Ginecología", "Hematología", "Infectología", "Medicina Interna", "Nefrología", "Neurología", "Oncología", "Oftalmología", "Ortopedia", "Otorrinolaringología", "Pediatría", "Psiquiatría", "Radiología", "Reumatología", "Traumatología", "Urología"];
export declare const BLOOD_TYPES: readonly ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export declare const GENDERS: readonly ["male", "female", "other"];
export declare const APPOINTMENT_TYPES: readonly ["consultation", "examination", "follow_up", "emergency", "surgery", "vaccination"];
export declare const APPOINTMENT_STATUSES: readonly ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"];
export declare const MEDICAL_RECORD_TYPES: readonly ["consultation", "examination", "prescription", "lab_result", "imaging", "surgery", "vaccination"];
export declare const PRIORITIES: readonly ["low", "medium", "high", "critical"];
export declare const USER_ROLES: readonly ["admin", "doctor", "patient", "nurse", "receptionist"];
export declare const NORMAL_VITAL_SIGNS: {
    readonly bloodPressure: {
        readonly systolic: {
            readonly min: 90;
            readonly max: 140;
        };
        readonly diastolic: {
            readonly min: 60;
            readonly max: 90;
        };
    };
    readonly heartRate: {
        readonly min: 60;
        readonly max: 100;
    };
    readonly temperature: {
        readonly min: 36.1;
        readonly max: 37.2;
    };
    readonly respiratoryRate: {
        readonly min: 12;
        readonly max: 20;
    };
    readonly oxygenSaturation: {
        readonly min: 95;
        readonly max: 100;
    };
};
export declare const BMI_CATEGORIES: {
    readonly underweight: {
        readonly min: 0;
        readonly max: 18.5;
        readonly label: "Bajo peso";
    };
    readonly normal: {
        readonly min: 18.5;
        readonly max: 24.9;
        readonly label: "Peso normal";
    };
    readonly overweight: {
        readonly min: 25;
        readonly max: 29.9;
        readonly label: "Sobrepeso";
    };
    readonly obese: {
        readonly min: 30;
        readonly max: 34.9;
        readonly label: "Obesidad";
    };
    readonly severelyObese: {
        readonly min: 35;
        readonly max: 39.9;
        readonly label: "Obesidad severa";
    };
    readonly morbidlyObese: {
        readonly min: 40;
        readonly max: number;
        readonly label: "Obesidad mórbida";
    };
};
export declare const ICD10_CATEGORIES: readonly ["A00-B99", "C00-D49", "D50-D89", "E00-E89", "F01-F99", "G00-G99", "H00-H59", "H60-H95", "I00-I99", "J00-J99", "K00-K95", "L00-L99", "M00-M99", "N00-N99", "O00-O9A", "P00-P96", "Q00-Q99", "R00-R99", "S00-T88", "V01-Y99", "Z00-Z99"];
export declare const MEDICAL_UNITS: {
    readonly weight: "kg";
    readonly height: "cm";
    readonly temperature: "°C";
    readonly bloodPressure: "mmHg";
    readonly heartRate: "lpm";
    readonly respiratoryRate: "rpm";
    readonly oxygenSaturation: "%";
    readonly bloodGlucose: "mg/dL";
    readonly cholesterol: "mg/dL";
    readonly creatinine: "mg/dL";
    readonly hemoglobin: "g/dL";
    readonly whiteBloodCells: "cells/μL";
    readonly platelets: "cells/μL";
};
export declare const MEDICAL_COLORS: {
    readonly primary: "#2563eb";
    readonly secondary: "#64748b";
    readonly success: "#16a34a";
    readonly warning: "#ca8a04";
    readonly danger: "#dc2626";
    readonly info: "#0891b2";
    readonly emergency: "#dc2626";
    readonly critical: "#991b1b";
    readonly normal: "#16a34a";
    readonly abnormal: "#ca8a04";
    readonly high: "#dc2626";
    readonly low: "#0891b2";
};
export declare const MEDICAL_ICONS: {
    readonly patient: "👤";
    readonly doctor: "👨‍⚕️";
    readonly nurse: "👩‍⚕️";
    readonly hospital: "🏥";
    readonly ambulance: "🚑";
    readonly medicine: "💊";
    readonly syringe: "💉";
    readonly stethoscope: "🩺";
    readonly thermometer: "🌡️";
    readonly heart: "❤️";
    readonly brain: "🧠";
    readonly bone: "🦴";
    readonly eye: "👁️";
    readonly ear: "👂";
    readonly tooth: "🦷";
    readonly blood: "🩸";
    readonly dna: "🧬";
    readonly microscope: "🔬";
    readonly xray: "📷";
    readonly pill: "💊";
    readonly bandage: "🩹";
    readonly wheelchair: "♿";
    readonly crutches: "🩼";
};
export declare const MEDICAL_MESSAGES: {
    readonly appointment: {
        readonly created: "Cita creada exitosamente";
        readonly updated: "Cita actualizada exitosamente";
        readonly cancelled: "Cita cancelada exitosamente";
        readonly confirmed: "Cita confirmada exitosamente";
        readonly reminder: "Recordatorio de cita médica";
    };
    readonly prescription: {
        readonly created: "Prescripción creada exitosamente";
        readonly updated: "Prescripción actualizada exitosamente";
        readonly cancelled: "Prescripción cancelada exitosamente";
        readonly completed: "Prescripción completada exitosamente";
    };
    readonly medicalRecord: {
        readonly created: "Registro médico creado exitosamente";
        readonly updated: "Registro médico actualizado exitosamente";
        readonly archived: "Registro médico archivado exitosamente";
    };
    readonly labResult: {
        readonly created: "Resultado de laboratorio creado exitosamente";
        readonly updated: "Resultado de laboratorio actualizado exitosamente";
        readonly abnormal: "Resultado de laboratorio anormal detectado";
    };
    readonly patient: {
        readonly created: "Paciente registrado exitosamente";
        readonly updated: "Información del paciente actualizada exitosamente";
        readonly discharged: "Paciente dado de alta exitosamente";
    };
    readonly doctor: {
        readonly created: "Doctor registrado exitosamente";
        readonly updated: "Información del doctor actualizada exitosamente";
        readonly verified: "Doctor verificado exitosamente";
    };
};
export declare const MEDICAL_VALIDATION: {
    readonly dni: {
        readonly pattern: RegExp;
        readonly message: "El DNI debe tener 8 dígitos";
    };
    readonly phone: {
        readonly pattern: RegExp;
        readonly message: "Número de teléfono inválido";
    };
    readonly email: {
        readonly pattern: RegExp;
        readonly message: "Email inválido";
    };
    readonly bloodPressure: {
        readonly systolic: {
            readonly min: 70;
            readonly max: 200;
        };
        readonly diastolic: {
            readonly min: 40;
            readonly max: 130;
        };
        readonly message: "Valores de presión arterial fuera de rango";
    };
    readonly heartRate: {
        readonly min: 40;
        readonly max: 200;
        readonly message: "Frecuencia cardíaca fuera de rango";
    };
    readonly temperature: {
        readonly min: 35;
        readonly max: 42;
        readonly message: "Temperatura fuera de rango";
    };
    readonly weight: {
        readonly min: 0.5;
        readonly max: 500;
        readonly message: "Peso fuera de rango";
    };
    readonly height: {
        readonly min: 30;
        readonly max: 250;
        readonly message: "Altura fuera de rango";
    };
};
//# sourceMappingURL=medical.d.ts.map