/**
 * 📦 REPOSITORIES INDEX - ALTAMEDICA DATABASE
 * Export centralizado de todos los repositories
 */

// Base Repository
export { BaseRepository, type BaseEntity, type ServiceContext, type QueryOptions, type RepositoryResult } from './BaseRepository';

// Medical Repositories
export { MedicalRecordRepository, medicalRecordRepository, type MedicalRecord } from './MedicalRecordRepository';
export { PatientRepository, patientRepository, type Patient } from './PatientRepository';
export { DoctorRepository, doctorRepository, type Doctor } from './DoctorRepository';
export { AppointmentRepository, appointmentRepository, type Appointment } from './AppointmentRepository';

// TODO: Add more repositories as they are implemented
// export { PrescriptionRepository, prescriptionRepository } from './PrescriptionRepository';
// export { TelemedicineRepository, telemedicineRepository } from './TelemedicineRepository';