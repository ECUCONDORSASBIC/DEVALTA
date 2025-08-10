'use client';

import { initializeFirebaseSimple } from '@/lib/firebase-simple';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from "@altamedica/auth";
import { firebaseService } from '@altamedica/database';
import { useEffect, useState } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        if (!firebaseService.isReady) {
          // La configuración ahora viene de @altamedica/database
          console.log('Inicializando Firebase desde configuración centralizada...');
        }
        setFirebaseInitialized(true);
      } catch (error) {
        console.error('Error with main Firebase service, trying simple initialization:', error);
        // Fallback a método simple
        try {
          initializeFirebaseSimple();
          setFirebaseInitialized(true);
        } catch (simpleError) {
          console.error('Error with simple Firebase initialization:', simpleError);
          // Continuar de todas formas para desarrollo
          setFirebaseInitialized(true);
        }
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