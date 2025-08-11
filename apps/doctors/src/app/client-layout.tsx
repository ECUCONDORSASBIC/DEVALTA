'use client';

import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from "@altamedica/auth";
import { useEffect, useState } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
  // Inicialización real usando el wrapper centralizado
  console.log('Inicializando Firebase (wrapper centralizado)...');
  // initializeFirebase maneja validación y emuladores vía envs
  initializeFirebase();
  setFirebaseInitialized(true);
      } catch (error) {
  console.error('Error inicializando Firebase:', error);
  // Continuar de todas formas para desarrollo
  setFirebaseInitialized(true);
      }
    };
    initializeFirebase();
  }, []);

  // Mostrar loading mientras Firebase se inicializa
  if (!firebaseInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando servicios médicos...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}