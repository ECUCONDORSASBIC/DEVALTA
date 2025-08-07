/**
 * @fileoverview Hooks de formularios centralizados
 * @module @altamedica/hooks/forms
 * @description Hooks para gestión de formularios, validación y estado
 */

// Hooks de formularios básicos
export { useForm, useFormState } from './useForm';
export { useField, useFieldArray } from './useField';
export { useValidation, useValidator } from './useValidation';
export { useFormValues, useFormErrors } from './useFormValues';

// Hooks de validación avanzada
export { useAsyncValidation, useDebounceValidation } from './useAsyncValidation';
export { useSchemaValidation, useYupValidation } from './useSchemaValidation';
export { useCustomValidation, useConditionalValidation } from './useCustomValidation';

// Hooks de estado de formulario
export { useFormPersistence, useFormStorage } from './useFormPersistence';
export { useFormHistory, useUndoRedo } from './useFormHistory';
export { useFormSubmission, useSubmitStatus } from './useFormSubmission';

// Hooks de campos especializados
export { useFileUpload, useMultipleFileUpload } from './useFileUpload';
export { useAutocomplete, useCombobox } from './useAutocomplete';
export { useSelectField, useMultiSelect } from './useSelectField';
export { useDatePicker, useDateRange } from './useDatePicker';

// Hooks médicos de formularios
export { useMedicalForm, usePatientForm } from './useMedicalForm';
export { useHIPAACompliantForm, useSecureForm } from './useHIPAACompliantForm';
export { usePrescriptionForm, useMedicalRecordForm } from './useMedicalRecordForm';
export { useSymptomForm, useDiagnosisForm } from './useSymptomForm';

// Hooks de formularios dinámicos
export { useDynamicForm, useFormBuilder } from './useDynamicForm';
export { useConditionalFields, useDependentFields } from './useConditionalFields';
export { useFormWizard, useStepForm } from './useFormWizard';

// Hooks de integración
export { useFormWithAPI, useFormSubmitToAPI } from './useFormWithAPI';
export { useFormWithAuth, useAuthenticatedForm } from './useFormWithAuth';
export { useFormWithCache, useCachedForm } from './useFormWithCache';

// Tipos principales
export type {
  FormConfig,
  FormState,
  FieldConfig,
  ValidationConfig,
  ValidationRule,
  FormError,
  SubmissionConfig,
  MedicalFormConfig
} from './types';

// Constantes y utilidades
export { VALIDATION_RULES, MEDICAL_VALIDATION_RULES } from './constants';
export { createFormConfig, createMedicalFormConfig } from './config';