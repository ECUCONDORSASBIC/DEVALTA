import React from 'react';

export function useTelemedicineSession() {
  return {
    session: null,
    isLoading: false,
    error: null
  };
}

export default function EmergencyTelemedicineComponent() {
  return (
    <div className='flex items-center justify-center min-h-[400px] bg-red-50 border-2 border-red-200 rounded-lg p-8'>
      <div className='text-center'>
        <h2 className='text-xl font-semibold text-red-800 mb-2'>
          Telemedicina Deshabilitada
        </h2>
        <p className='text-red-600 mb-4'>
          Esta funcionalidad ha sido deshabilitada temporalmente debido a una emergencia de compliance HIPAA.
        </p>
      </div>
    </div>
  );
} 