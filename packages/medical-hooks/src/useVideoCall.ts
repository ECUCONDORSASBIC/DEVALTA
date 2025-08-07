// 🎥 Hook Centralizado para Video Llamadas
// Usado por doctors y patients apps

import { useState, useCallback } from 'react';
import { useApiBridge } from './useApiBridge';

export interface VideoCall {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  status: 'waiting' | 'active' | 'ended';
  roomUrl?: string;
  startTime?: string;
  endTime?: string;
}

export function useVideoCall() {
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);
  const { makeRequest, loading, error } = useApiBridge();

  const createVideoCall = useCallback(async (appointmentId: string, token?: string) => {
    const result = await makeRequest('/api/v1/telemedicine/sessions', {
      method: 'POST',
      data: { appointmentId },
      token
    });
    
    if (result.success) {
      setActiveCall(result.data);
    }
    
    return result;
  }, [makeRequest]);

  const getActiveCalls = useCallback(async (token?: string) => {
    const result = await makeRequest('/api/v1/telemedicine/sessions/active', {
      token
    });
    
    return result;
  }, [makeRequest]);

  const endVideoCall = useCallback(async (callId: string, token?: string) => {
    const result = await makeRequest(`/api/v1/telemedicine/sessions/${callId}/end`, {
      method: 'POST',
      token
    });
    
    if (result.success) {
      setActiveCall(null);
    }
    
    return result;
  }, [makeRequest]);

  return {
    activeCall,
    loading,
    error,
    createVideoCall,
    getActiveCalls,
    endVideoCall
  };
}