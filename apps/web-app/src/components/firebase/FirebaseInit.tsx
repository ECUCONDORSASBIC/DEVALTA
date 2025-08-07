'use client';

// Firebase se inicializa automáticamente al importar config-production
// Este componente ya no es necesario pero se mantiene por compatibilidad
// El AuthService ahora usa lazy initialization para evitar problemas de orden
export default function FirebaseInit() {
  return null;
}