// Mock Firebase para desarrollo local sin dependencias externas
export interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
}

export class MockAuth {
  private currentUser: MockUser | null = null;
  private authStateChangeListeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // Simular usuario logueado para desarrollo
    this.currentUser = {
      uid: "mock-patient-id-123",
      email: "paciente.test@altamedica.com",
      displayName: "Juan Pérez"
    };
  }

  get user() {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.authStateChangeListeners.push(callback);
    // Llamar inmediatamente con el estado actual
    callback(this.currentUser);
    
    // Retornar función de cleanup
    return () => {
      const index = this.authStateChangeListeners.indexOf(callback);
      if (index > -1) {
        this.authStateChangeListeners.splice(index, 1);
      }
    };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    // Simular autenticación exitosa
    this.currentUser = {
      uid: "mock-patient-id-123",
      email,
      displayName: "Usuario Test"
    };
    
    // Notificar a los listeners
    this.authStateChangeListeners.forEach(callback => callback(this.currentUser));
    
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    this.authStateChangeListeners.forEach(callback => callback(null));
  }

  async getIdToken() {
    return "mock-jwt-token-for-development";
  }
}

export class MockFirestore {
  doc(path: string) {
    return {
      get: async () => ({
        exists: () => true,
        data: () => ({
          id: "mock-patient-id-123",
          email: "paciente.test@altamedica.com",
          firstName: "Juan",
          lastName: "Pérez",
          role: "patient",
          permissions: ["patient:read", "patient:appointments"],
          isActive: true,
          patientId: "mock-patient-id-123"
        })
      }),
      set: async (data: any) => ({ success: true }),
      update: async (data: any) => ({ success: true })
    };
  }

  collection(path: string) {
    return {
      doc: (id: string) => this.doc(`${path}/${id}`)
    };
  }
}

// Instancias mock para usar en el desarrollo
export const auth = new MockAuth();
export const db = new MockFirestore();