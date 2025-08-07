/**
 * Hook integrado para gestión de historiales médicos con backend dockerizado
 * Utiliza React Query para cache y el servicio de medical records
 */

import { useTanstackQuery as useQuery, useMutation, useQueryClient } from '@altamedica/hooks';
import { 
  medicalRecordsService,
  MedicalRecord,
  Prescription,
  VitalSigns,
  CreateMedicalRecordRequest,
  CreatePrescriptionRequest,
  FileAttachment
} from '../services/medical-records-service';
import { useState } from 'react';

// Keys para queries de React Query
export const medicalRecordsQueryKeys = {
  all: ['medical-records'] as const,
  lists: () => [...medicalRecordsQueryKeys.all, 'list'] as const,
  list: (filters?: any) => [...medicalRecordsQueryKeys.lists(), { filters }] as const,
  details: () => [...medicalRecordsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicalRecordsQueryKeys.details(), id] as const,
  patient: (patientId: string) => [...medicalRecordsQueryKeys.all, 'patient', patientId] as const,
  search: (query: string, patientId?: string) => [...medicalRecordsQueryKeys.all, 'search', query, patientId] as const,
  summary: (patientId: string) => [...medicalRecordsQueryKeys.all, 'summary', patientId] as const,
  prescriptions: () => ['prescriptions'] as const,
  prescriptionsList: (filters?: any) => [...medicalRecordsQueryKeys.prescriptions(), 'list', { filters }] as const,
  prescriptionDetail: (id: string) => [...medicalRecordsQueryKeys.prescriptions(), id] as const,
  prescriptionsByPatient: (patientId: string) => [...medicalRecordsQueryKeys.prescriptions(), 'patient', patientId] as const,
  activePrescriptions: (patientId: string) => [...medicalRecordsQueryKeys.prescriptions(), 'active', patientId] as const,
  vitalSigns: (patientId: string, dates?: any) => [...medicalRecordsQueryKeys.all, 'vital-signs', patientId, dates] as const,
  allergies: (patientId: string) => [...medicalRecordsQueryKeys.all, 'allergies', patientId] as const,
  currentMedications: (patientId: string) => [...medicalRecordsQueryKeys.all, 'current-medications', patientId] as const,
  attachments: (recordId: string) => [...medicalRecordsQueryKeys.all, 'attachments', recordId] as const,
};

/**
 * Hook para obtener registros médicos con filtros
 */
export function useMedicalRecords(filters?: {
  page?: number;
  limit?: number;
  patientId?: string;
  recordType?: string;
}) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.list(filters),
    queryFn: async () => {
      const response = await medicalRecordsService.getMedicalRecords(
        filters?.page,
        filters?.limit,
        filters?.patientId,
        filters?.recordType
      );
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener registros médicos');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener un registro médico específico
 */
export function useMedicalRecord(recordId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.detail(recordId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getMedicalRecordById(recordId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener registro médico');
      }
      return response.data;
    },
    enabled: !!recordId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener registros médicos de un paciente específico
 */
export function usePatientMedicalRecords(patientId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.patient(patientId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getPatientMedicalRecords(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener registros del paciente');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para búsqueda de registros médicos
 */
export function useMedicalRecordSearch() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [recordType, setRecordType] = useState<string>('');

  const query = useQuery({
    queryKey: medicalRecordsQueryKeys.search(searchQuery, patientId),
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const response = await medicalRecordsService.searchMedicalRecords(
        searchQuery,
        patientId || undefined,
        recordType || undefined
      );
      if (!response.success) {
        throw new Error(response.error || 'Error en la búsqueda');
      }
      return response.data;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    searchQuery,
    setSearchQuery,
    patientId,
    setPatientId,
    recordType,
    setRecordType,
    clearSearch: () => {
      setSearchQuery('');
      setPatientId('');
      setRecordType('');
    },
    hasQuery: searchQuery.length >= 2,
  };
}

/**
 * Hook para obtener resumen médico de un paciente
 */
export function useMedicalSummary(patientId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.summary(patientId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getMedicalSummary(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener resumen médico');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutos para resumen
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook para obtener prescripciones con filtros
 */
export function usePrescriptions(filters?: {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.prescriptionsList(filters),
    queryFn: async () => {
      const response = await medicalRecordsService.getPrescriptions(
        filters?.page,
        filters?.limit,
        filters?.patientId,
        filters?.status
      );
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener prescripciones');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener prescripciones de un paciente
 */
export function usePatientPrescriptions(patientId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.prescriptionsByPatient(patientId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getPatientPrescriptions(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener prescripciones del paciente');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener prescripciones activas de un paciente
 */
export function useActivePrescriptions(patientId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.activePrescriptions(patientId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getActivePrescriptions(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener prescripciones activas');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutos para datos más actuales
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });
}

/**
 * Hook para obtener signos vitales de un paciente
 */
export function useVitalSigns(
  patientId: string | undefined | null,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.vitalSigns(patientId!, { startDate, endDate }),
    queryFn: async () => {
      const response = await medicalRecordsService.getVitalSigns(patientId!, startDate, endDate);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener signos vitales');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener alergias de un paciente
 */
export function usePatientAllergies(patientId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.allergies(patientId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getPatientAllergies(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener alergias');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutos para alergias (cambian poco)
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook para obtener medicamentos actuales de un paciente
 */
export function useCurrentMedications(patientId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.currentMedications(patientId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getCurrentMedications(patientId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener medicamentos actuales');
      }
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener archivos adjuntos de un registro
 */
export function useRecordAttachments(recordId: string | undefined | null) {
  return useQuery({
    queryKey: medicalRecordsQueryKeys.attachments(recordId!),
    queryFn: async () => {
      const response = await medicalRecordsService.getAttachments(recordId!);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener archivos adjuntos');
      }
      return response.data;
    },
    enabled: !!recordId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Hook para crear un nuevo registro médico
 */
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordData: CreateMedicalRecordRequest) => {
      const response = await medicalRecordsService.createMedicalRecord(recordData);
      if (!response.success) {
        throw new Error(response.error || 'Error al crear registro médico');
      }
      return response.data;
    },
    onSuccess: (newRecord, variables) => {
      // Invalidar listas de registros
      queryClient.invalidateQueries({ queryKey: medicalRecordsQueryKeys.lists() });
      
      // Invalidar registros del paciente específico
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.patient(variables.patientId) 
      });
      
      // Invalidar resumen médico del paciente
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.summary(variables.patientId) 
      });
    },
    onError: (error) => {
      console.error('Error creating medical record:', error);
    },
  });
}

/**
 * Hook para actualizar un registro médico
 */
export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, updates }: { 
      recordId: string; 
      updates: Partial<CreateMedicalRecordRequest> 
    }) => {
      const response = await medicalRecordsService.updateMedicalRecord(recordId, updates);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar registro médico');
      }
      return response.data;
    },
    onSuccess: (updatedRecord, variables) => {
      const { recordId } = variables;
      
      // Actualizar cache específico del registro
      queryClient.setQueryData(medicalRecordsQueryKeys.detail(recordId), updatedRecord);
      
      // Invalidar listas y resumen del paciente
      queryClient.invalidateQueries({ queryKey: medicalRecordsQueryKeys.lists() });
      
      if (updatedRecord.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: medicalRecordsQueryKeys.patient(updatedRecord.patientId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: medicalRecordsQueryKeys.summary(updatedRecord.patientId) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating medical record:', error);
    },
  });
}

/**
 * Hook para crear una nueva prescripción
 */
export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescriptionData: CreatePrescriptionRequest) => {
      const response = await medicalRecordsService.createPrescription(prescriptionData);
      if (!response.success) {
        throw new Error(response.error || 'Error al crear prescripción');
      }
      return response.data;
    },
    onSuccess: (newPrescription, variables) => {
      // Invalidar listas de prescripciones
      queryClient.invalidateQueries({ queryKey: medicalRecordsQueryKeys.prescriptions() });
      
      // Invalidar prescripciones del paciente
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.prescriptionsByPatient(variables.patientId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.activePrescriptions(variables.patientId) 
      });
      
      // Invalidar medicamentos actuales del paciente
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.currentMedications(variables.patientId) 
      });
    },
    onError: (error) => {
      console.error('Error creating prescription:', error);
    },
  });
}

/**
 * Hook para actualizar estado de una prescripción
 */
export function useUpdatePrescriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prescriptionId, status }: { 
      prescriptionId: string; 
      status: 'active' | 'completed' | 'cancelled' | 'expired' 
    }) => {
      const response = await medicalRecordsService.updatePrescriptionStatus(prescriptionId, status);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar prescripción');
      }
      return response.data;
    },
    onSuccess: (updatedPrescription, variables) => {
      const { prescriptionId } = variables;
      
      // Actualizar cache específico de la prescripción
      queryClient.setQueryData(medicalRecordsQueryKeys.prescriptionDetail(prescriptionId), updatedPrescription);
      
      // Invalidar listas de prescripciones
      queryClient.invalidateQueries({ queryKey: medicalRecordsQueryKeys.prescriptions() });
      
      if (updatedPrescription.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: medicalRecordsQueryKeys.activePrescriptions(updatedPrescription.patientId) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating prescription status:', error);
    },
  });
}

/**
 * Hook para registrar signos vitales
 */
export function useRecordVitalSigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, vitalSigns }: { 
      patientId: string; 
      vitalSigns: Omit<VitalSigns, 'recordedAt'> 
    }) => {
      const response = await medicalRecordsService.recordVitalSigns(patientId, vitalSigns);
      if (!response.success) {
        throw new Error(response.error || 'Error al registrar signos vitales');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      const { patientId } = variables;
      
      // Invalidar signos vitales del paciente
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.vitalSigns(patientId, {}) 
      });
      
      // Invalidar resumen médico
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.summary(patientId) 
      });
    },
    onError: (error) => {
      console.error('Error recording vital signs:', error);
    },
  });
}

/**
 * Hook para subir archivo adjunto
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, file, description }: { 
      recordId: string; 
      file: File; 
      description?: string 
    }) => {
      const response = await medicalRecordsService.uploadAttachment(recordId, file, description);
      if (!response.success) {
        throw new Error(response.error || 'Error al subir archivo');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      const { recordId } = variables;
      
      // Invalidar archivos adjuntos del registro
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordsQueryKeys.attachments(recordId) 
      });
    },
    onError: (error) => {
      console.error('Error uploading attachment:', error);
    },
  });
}

/**
 * Hook combinado para gestión completa de registros médicos
 */
export function useMedicalRecordsManager() {
  const createRecord = useCreateMedicalRecord();
  const updateRecord = useUpdateMedicalRecord();
  const createPrescription = useCreatePrescription();
  const updatePrescriptionStatus = useUpdatePrescriptionStatus();
  const recordVitalSigns = useRecordVitalSigns();
  const uploadAttachment = useUploadAttachment();

  return {
    // Operaciones de mutación
    createRecord,
    updateRecord,
    createPrescription,
    updatePrescriptionStatus,
    recordVitalSigns,
    uploadAttachment,
    
    // Estados de carga
    isCreatingRecord: createRecord.isPending,
    isUpdatingRecord: updateRecord.isPending,
    isCreatingPrescription: createPrescription.isPending,
    isUpdatingPrescription: updatePrescriptionStatus.isPending,
    isRecordingVitals: recordVitalSigns.isPending,
    isUploadingFile: uploadAttachment.isPending,
    
    // Estados de éxito
    recordCreateSuccess: createRecord.isSuccess,
    recordUpdateSuccess: updateRecord.isSuccess,
    prescriptionCreateSuccess: createPrescription.isSuccess,
    prescriptionUpdateSuccess: updatePrescriptionStatus.isSuccess,
    vitalsRecordSuccess: recordVitalSigns.isSuccess,
    uploadSuccess: uploadAttachment.isSuccess,
    
    // Errores
    recordCreateError: createRecord.error,
    recordUpdateError: updateRecord.error,
    prescriptionCreateError: createPrescription.error,
    prescriptionUpdateError: updatePrescriptionStatus.error,
    vitalsRecordError: recordVitalSigns.error,
    uploadError: uploadAttachment.error,
    
    // Datos de respuesta
    createdRecord: createRecord.data,
    updatedRecord: updateRecord.data,
    createdPrescription: createPrescription.data,
    updatedPrescription: updatePrescriptionStatus.data,
    recordedVitals: recordVitalSigns.data,
    uploadedFile: uploadAttachment.data,
    
    // Funciones de reset
    resetRecordCreate: createRecord.reset,
    resetRecordUpdate: updateRecord.reset,
    resetPrescriptionCreate: createPrescription.reset,
    resetPrescriptionUpdate: updatePrescriptionStatus.reset,
    resetVitalsRecord: recordVitalSigns.reset,
    resetUpload: uploadAttachment.reset,
  };
}