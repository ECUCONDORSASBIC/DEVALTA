'use client';

import { useEffect, useState } from 'react';

/**
 * 🚀 OPTIMIZED FIREBASE INIT
 * Inicialización lazy de Firebase para mejor performance
 */
export default function FirebaseInit() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Lazy initialization para evitar bloquear el rendering inicial
    const initFirebase = async () => {
      // Solo inicializar Firebase cuando realmente se necesite
      if (typeof window !== 'undefined' && !isInitialized) {
        try {
          // Dynamic import para reducir bundle inicial
          const { getAuth } = await import('firebase/auth');
          const auth = getAuth();
          
          // Configuraciones de performance
          auth.useDeviceLanguage(); // Optimización automática de idioma
          
          setIsInitialized(true);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Firebase initialized lazily');
          }
        } catch (error) {
          console.error('❌ Firebase initialization failed:', error);
        }
      }
    };

    // Delay la inicialización para no bloquear el critical path
    const timer = setTimeout(initFirebase, 500);
    
    return () => clearTimeout(timer);
  }, [isInitialized]);

  return null;
}