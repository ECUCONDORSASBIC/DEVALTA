/**
 * 👨‍⚕️ DOCTOR REPOSITORY - ALTAMEDICA
 * Repository especializado para gestión de doctores con funcionalidades médicas
 * específicas y validaciones profesionales
 */

import { BaseRepository, BaseEntity, ServiceContext, QueryOptions, RepositoryResult } from './BaseRepository';
import { z } from 'zod';
import { dbConnection } from '../core/DatabaseConnection';
import { DoctorSchema } from '../schemas/user-schemas';

// Doctor entity interface que extiende BaseEntity
export interface Doctor extends BaseEntity {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: 'doctor';
  licenseNumber: string;
  specialty: string[];
  subSpecialty?: string[];
  medicalSchool: string;
  graduationYear: number;
  yearsOfExperience: number;
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber?: string;
  }>;
  workplaces: Array<{
    hospitalId?: string;
    name: string;
    position: string;
    department?: string;
    startDate: Date;
    endDate?: Date;
    isCurrentWorkplace: boolean;
  }>;
  consultationFee?: number;
  availableSchedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  telemedicineEnabled: boolean;
  emergencyConsultations: boolean;
  acceptsNewPatients: boolean;
  rating?: number;
  reviewCount: number;
  totalConsultations: number;
  professionalSummary?: string;
  awards: Array<{
    title: string;
    organization: string;
    year: number;
    description?: string;
  }>;
  publications: Array<{
    title: string;
    journal: string;
    year: number;
    doi?: string;
    url?: string;
  }>;
  isVerified: boolean;
  verificationDate?: Date;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
}

export class DoctorRepository extends BaseRepository<Doctor> {
  constructor() {
    super('doctors', DoctorSchema);
  }

  /**
   * Buscar doctores por especialidad
   */
  async findBySpecialty(specialty: string, context?: ServiceContext): Promise<RepositoryResult<Doctor[]>> {
    try {
      const db = await dbConnection.getFirestore();
      
      const query = db.collection(this.collectionName)
        .where('specialty', 'array-contains', specialty)
        .where('status', '==', 'active')
        .where('isVerified', '==', true);

      const snapshot = await query.get();
      const doctors = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Doctor));

      await this.auditLog('READ_BY_SPECIALTY', { specialty }, context);

      return {
        success: true,
        data: doctors
      };
    } catch (error) {
      return this.handleError(error, 'findBySpecialty');
    }
  }

  /**
   * Buscar doctores por licencia médica
   */
  async findByLicenseNumber(licenseNumber: string, context?: ServiceContext): Promise<RepositoryResult<Doctor | null>> {
    try {
      const db = await dbConnection.getFirestore();
      
      const query = db.collection(this.collectionName)
        .where('licenseNumber', '==', licenseNumber)
        .limit(1);

      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return { success: true, data: null };
      }

      const doctor = { 
        id: snapshot.docs[0].id, 
        ...snapshot.docs[0].data() 
      } as Doctor;

      await this.auditLog('READ_BY_LICENSE', { licenseNumber }, context);

      return {
        success: true,
        data: doctor
      };
    } catch (error) {
      return this.handleError(error, 'findByLicenseNumber');
    }
  }

  /**
   * Buscar doctores disponibles para telemedicina
   */
  async findTelemedicineEnabled(context?: ServiceContext): Promise<RepositoryResult<Doctor[]>> {
    try {
      const db = await dbConnection.getFirestore();
      
      const query = db.collection(this.collectionName)
        .where('telemedicineEnabled', '==', true)
        .where('status', '==', 'active')
        .where('isVerified', '==', true)
        .where('acceptsNewPatients', '==', true);

      const snapshot = await query.get();
      const doctors = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Doctor));

      await this.auditLog('READ_TELEMEDICINE_ENABLED', {}, context);

      return {
        success: true,
        data: doctors
      };
    } catch (error) {
      return this.handleError(error, 'findTelemedicineEnabled');
    }
  }

  /**
   * Actualizar rating y estadísticas del doctor
   */
  async updateRating(doctorId: string, newRating: number, context?: ServiceContext): Promise<RepositoryResult<Doctor | null>> {
    try {
      const doctorResult = await this.findById(doctorId, context);
      if (!doctorResult.success || !doctorResult.data) {
        return { success: false, error: 'Doctor no encontrado' };
      }

      const doctor = doctorResult.data;
      const currentRating = doctor.rating || 0;
      const currentReviewCount = doctor.reviewCount || 0;

      // Calcular nuevo promedio
      const newReviewCount = currentReviewCount + 1;
      const newAverageRating = ((currentRating * currentReviewCount) + newRating) / newReviewCount;

      const updateData = {
        rating: Math.round(newAverageRating * 100) / 100, // 2 decimales
        reviewCount: newReviewCount,
        updatedAt: new Date()
      };

      const result = await this.update(doctorId, updateData, context);
      
      await this.auditLog('UPDATE_RATING', { 
        doctorId, 
        oldRating: currentRating, 
        newRating: newAverageRating,
        reviewCount: newReviewCount
      }, context);

      return result;
    } catch (error) {
      return this.handleError(error, 'updateRating');
    }
  }

  /**
   * Verificar doctor
   */
  async verifyDoctor(doctorId: string, context?: ServiceContext): Promise<RepositoryResult<Doctor | null>> {
    try {
      const updateData = {
        isVerified: true,
        verificationDate: new Date(),
        status: 'active' as const,
        updatedAt: new Date()
      };

      const result = await this.update(doctorId, updateData, context);
      
      await this.auditLog('DOCTOR_VERIFIED', { doctorId }, context);

      return result;
    } catch (error) {
      return this.handleError(error, 'verifyDoctor');
    }
  }

  /**
   * Suspender doctor
   */
  async suspendDoctor(doctorId: string, reason: string, context?: ServiceContext): Promise<RepositoryResult<Doctor | null>> {
    try {
      const updateData = {
        status: 'suspended' as const,
        updatedAt: new Date()
      };

      const result = await this.update(doctorId, updateData, context);
      
      await this.auditLog('DOCTOR_SUSPENDED', { doctorId, reason }, context);

      return result;
    } catch (error) {
      return this.handleError(error, 'suspendDoctor');
    }
  }

  /**
   * Buscar doctores con filtros avanzados
   */
  async searchDoctors(filters: {
    specialty?: string;
    location?: string;
    telemedicineEnabled?: boolean;
    acceptsNewPatients?: boolean;
    minRating?: number;
    maxConsultationFee?: number;
    availability?: { dayOfWeek: number; time: string };
  }, context?: ServiceContext): Promise<RepositoryResult<Doctor[]>> {
    try {
      const db = await dbConnection.getFirestore();
      let query = db.collection(this.collectionName)
        .where('status', '==', 'active')
        .where('isVerified', '==', true);

      // Aplicar filtros
      if (filters.specialty) {
        query = query.where('specialty', 'array-contains', filters.specialty);
      }
      
      if (filters.telemedicineEnabled !== undefined) {
        query = query.where('telemedicineEnabled', '==', filters.telemedicineEnabled);
      }
      
      if (filters.acceptsNewPatients !== undefined) {
        query = query.where('acceptsNewPatients', '==', filters.acceptsNewPatients);
      }

      const snapshot = await query.get();
      let doctors = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Doctor));

      // Filtros adicionales en memoria (para casos complejos)
      if (filters.minRating) {
        doctors = doctors.filter(doc => (doc.rating || 0) >= filters.minRating!);
      }

      if (filters.maxConsultationFee) {
        doctors = doctors.filter(doc => 
          !doc.consultationFee || doc.consultationFee <= filters.maxConsultationFee!
        );
      }

      await this.auditLog('SEARCH_DOCTORS', { filters }, context);

      return {
        success: true,
        data: doctors
      };
    } catch (error) {
      return this.handleError(error, 'searchDoctors');
    }
  }

  /**
   * Incrementar contador de consultas
   */
  async incrementConsultationCount(doctorId: string, context?: ServiceContext): Promise<RepositoryResult<Doctor | null>> {
    try {
      const doctorResult = await this.findById(doctorId, context);
      if (!doctorResult.success || !doctorResult.data) {
        return { success: false, error: 'Doctor no encontrado' };
      }

      const updateData = {
        totalConsultations: (doctorResult.data.totalConsultations || 0) + 1,
        updatedAt: new Date()
      };

      const result = await this.update(doctorId, updateData, context);
      
      await this.auditLog('INCREMENT_CONSULTATIONS', { doctorId }, context);

      return result;
    } catch (error) {
      return this.handleError(error, 'incrementConsultationCount');
    }
  }
}

// Instancia singleton del repository
export const doctorRepository = new DoctorRepository();