import { fhirclient } from 'fhir-kit-client';
import { 
  AltamedicaPatient, 
  AltamedicaPractitioner, 
  AltamedicaOrganization,
  AltamedicaAppointment,
  FHIRBundle 
} from './types';
import { MedicalDataValidator } from './validators';
import { HIPAAComplianceManager, FHIRComplianceChecker } from './compliance';

export default class FHIRClient {
  private client: any;
  private complianceManager: HIPAAComplianceManager;
  private baseUrl: string;

  constructor(baseUrl: string, encryptionKey: string) {
    this.baseUrl = baseUrl;
    this.client = fhirclient({
      baseUrl: baseUrl,
      customHeaders: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });
    this.complianceManager = new HIPAAComplianceManager(encryptionKey);
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData: Partial<AltamedicaPatient>): Promise<AltamedicaPatient> {
    // Validate patient data
    const validation = MedicalDataValidator.validatePatient(patientData);
    if (!validation.isValid) {
      throw new Error(`Patient validation failed: ${validation.errors.join(', ')}`);
    }

    // Check FHIR compliance
    const compliance = FHIRComplianceChecker.validateFHIRCompliance(patientData, 'Patient');
    if (!compliance.compliant) {
      throw new Error(`FHIR compliance check failed: ${compliance.errors.join(', ')}`);
    }

    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'create',
      resourceType: 'Patient',
      resourceId: 'new',
      authorized: true,
      containsPHI: true,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.create({
        resourceType: 'Patient',
        ...patientData
      });

      return response as AltamedicaPatient;
    } catch (error) {
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(patientId: string): Promise<AltamedicaPatient> {
    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'read',
      resourceType: 'Patient',
      resourceId: patientId,
      authorized: true,
      containsPHI: true,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.read({
        resourceType: 'Patient',
        id: patientId
      });

      return response as AltamedicaPatient;
    } catch (error) {
      throw new Error(`Failed to get patient ${patientId}: ${error.message}`);
    }
  }

  /**
   * Update patient
   */
  async updatePatient(patientId: string, patientData: Partial<AltamedicaPatient>): Promise<AltamedicaPatient> {
    // Validate patient data
    const validation = MedicalDataValidator.validatePatient(patientData);
    if (!validation.isValid) {
      throw new Error(`Patient validation failed: ${validation.errors.join(', ')}`);
    }

    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'update',
      resourceType: 'Patient',
      resourceId: patientId,
      authorized: true,
      containsPHI: true,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.update({
        resourceType: 'Patient',
        id: patientId,
        ...patientData
      });

      return response as AltamedicaPatient;
    } catch (error) {
      throw new Error(`Failed to update patient ${patientId}: ${error.message}`);
    }
  }

  /**
   * Search patients
   */
  async searchPatients(searchParams: {
    name?: string;
    identifier?: string;
    birthDate?: string;
    gender?: string;
    _count?: number;
  }): Promise<FHIRBundle> {
    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'search',
      resourceType: 'Patient',
      resourceId: 'search',
      authorized: true,
      containsPHI: true,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.search({
        resourceType: 'Patient',
        searchParams
      });

      return response as FHIRBundle;
    } catch (error) {
      throw new Error(`Failed to search patients: ${error.message}`);
    }
  }

  /**
   * Create appointment
   */
  async createAppointment(appointmentData: Partial<AltamedicaAppointment>): Promise<AltamedicaAppointment> {
    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'create',
      resourceType: 'Appointment',
      resourceId: 'new',
      authorized: true,
      containsPHI: true,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.create({
        resourceType: 'Appointment',
        ...appointmentData
      });

      return response as AltamedicaAppointment;
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(appointmentId: string): Promise<AltamedicaAppointment> {
    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'read',
      resourceType: 'Appointment',
      resourceId: appointmentId,
      authorized: true,
      containsPHI: true,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.read({
        resourceType: 'Appointment',
        id: appointmentId
      });

      return response as AltamedicaAppointment;
    } catch (error) {
      throw new Error(`Failed to get appointment ${appointmentId}: ${error.message}`);
    }
  }

  /**
   * Search appointments
   */
  async searchAppointments(searchParams: {
    patient?: string;
    practitioner?: string;
    date?: string;
    status?: string;
    _count?: number;
  }): Promise<FHIRBundle> {
    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'search',
      resourceType: 'Appointment',
      resourceId: 'search',
      authorized: true,
      containsPHI: true,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.search({
        resourceType: 'Appointment',
        searchParams
      });

      return response as FHIRBundle;
    } catch (error) {
      throw new Error(`Failed to search appointments: ${error.message}`);
    }
  }

  /**
   * Create practitioner
   */
  async createPractitioner(practitionerData: Partial<AltamedicaPractitioner>): Promise<AltamedicaPractitioner> {
    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'create',
      resourceType: 'Practitioner',
      resourceId: 'new',
      authorized: true,
      containsPHI: false,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.create({
        resourceType: 'Practitioner',
        ...practitionerData
      });

      return response as AltamedicaPractitioner;
    } catch (error) {
      throw new Error(`Failed to create practitioner: ${error.message}`);
    }
  }

  /**
   * Get practitioner by ID
   */
  async getPractitioner(practitionerId: string): Promise<AltamedicaPractitioner> {
    // Log access for compliance
    this.complianceManager.logPHIAccess({
      timestamp: new Date().toISOString(),
      userId: 'system',
      action: 'read',
      resourceType: 'Practitioner',
      resourceId: practitionerId,
      authorized: true,
      containsPHI: false,
      transmissionType: 'encrypted'
    });

    try {
      const response = await this.client.read({
        resourceType: 'Practitioner',
        id: practitionerId
      });

      return response as AltamedicaPractitioner;
    } catch (error) {
      throw new Error(`Failed to get practitioner ${practitionerId}: ${error.message}`);
    }
  }

  /**
   * Get compliance report
   */
  getComplianceReport(startDate: Date, endDate: Date) {
    return this.complianceManager.generateComplianceReport(startDate, endDate);
  }

  /**
   * Validate FHIR resource
   */
  validateResource(resource: any, resourceType: string) {
    return FHIRComplianceChecker.validateFHIRCompliance(resource, resourceType);
  }

  /**
   * Validate FHIR bundle
   */
  validateBundle(bundle: any) {
    return FHIRComplianceChecker.validateBundleCompliance(bundle);
  }
} 