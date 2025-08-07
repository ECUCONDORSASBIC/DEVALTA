// @altamedica/medical-hooks - Hooks médicos centralizados
export const medicalHooksVersion = '1.0.0';

// Base API hook
export { useApiBridge } from './useApiBridge';
export type { ApiResponse, UseApiOptions } from './useApiBridge';

// Medical domain hooks
export { useAppointments } from './useAppointments';
export type { Appointment } from './useAppointments';

// WebRTC Telemedicine hooks
export { useWebRTC } from './useWebRTC';
export type { WebRTCConfig, WebRTCState, ConnectionStats } from './useWebRTC';

// Patient management hooks
export { usePatients, usePatientsSearch } from './usePatients';
export type { Patient } from './usePatients';

// Video call management hooks
export { useVideoCall } from './useVideoCall';
export type { VideoCall } from './useVideoCall';