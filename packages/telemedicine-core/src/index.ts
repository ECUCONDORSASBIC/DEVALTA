// @altamedica/telemedicine-core
export const telemedicineCoreVersion = '1.0.0';

// Video Call Client
export {
  AltaMedicaVideoCallClient,
  createConsultationCall,
  useVideoCall
} from './videoCallClient';

// Unified Telemedicine Hook (NUEVO)
export {
  useTelemedicineUnified
} from './useTelemedicineUnified';

// Export types
export type {
  VideoCallResponse,
  CreateCallRequest,
  CallStatus,
  ActiveCall
} from './videoCallClient';

export type {
  UnifiedTelemedicineConfig,
  TelemedicineSession,
  UnifiedTelemedicineState
} from './useTelemedicineUnified';
