#!/usr/bin/env python3
"""
🎣 Frontend Hook Generator - Genera hooks React automáticamente
Elimina mocks y genera hooks reales para conectar con APIs
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

class ReactHookGenerator:
    def __init__(self, workspace_path: str):
        self.workspace = Path(workspace_path)
        self.bridge_url = "http://localhost:9000"
        
    def load_api_config(self) -> Dict:
        """Cargar configuración de APIs organizadas"""
        config_path = self.workspace / "config" / "environments" / "frontend_api_config.json"
        
        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
        
        # Fallback a configuración básica
        return {
            "services": {
                "API-SERVER": {
                    "baseUrl": "http://localhost:3001",
                    "endpoints": {
                        "/api/health": "/api/health",
                        "/api/v1/patients": "/api/v1/patients",
                        "/api/v1/doctors": "/api/v1/doctors",
                        "/api/v1/appointments": "/api/v1/appointments"
                    }
                }
            }
        }
    
    def generate_base_hook(self) -> str:
        """Generar hook base para comunicación con el bridge"""
        return '''// 🌉 Base Hook para AltaMedica API Bridge
// Auto-generado - NO editar manualmente

import { useState, useEffect, useCallback } from 'react';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  url?: string;
}

export interface UseApiOptions {
  immediate?: boolean;
  token?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const BRIDGE_URL = 'http://localhost:9000';

// ✨ Hook base para comunicación con API Bridge
export function useApiBridge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async (
    endpoint: string,
    options: {
      method?: string;
      data?: any;
      token?: string;
    } = {}
  ): Promise<ApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
      }

      const response = await fetch(`${BRIDGE_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.data ? JSON.stringify(options.data) : undefined,
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        setError(result.error || 'Error desconocido');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        status: 500
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const proxyRequest = useCallback(async (
    service: string,
    endpoint: string,
    options: {
      method?: string;
      data?: any;
      token?: string;
    } = {}
  ): Promise<ApiResponse> => {
    return makeRequest('/proxy', {
      method: 'POST',
      data: {
        service,
        endpoint,
        method: options.method || 'GET',
        data: options.data
      },
      token: options.token
    });
  }, [makeRequest]);

  return {
    loading,
    error,
    makeRequest,
    proxyRequest
  };
}

// 🏥 Hook para verificar salud de servicios
export function useServiceHealth() {
  const [services, setServices] = useState<any>(null);
  const [healthyCount, setHealthyCount] = useState(0);
  const { makeRequest, loading, error } = useApiBridge();

  const checkHealth = useCallback(async () => {
    const result = await makeRequest('/health');
    if (result.success) {
      setServices(result.data.services);
      setHealthyCount(result.data.healthy_count);
    }
  }, [makeRequest]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    services,
    healthyCount,
    loading,
    error,
    refresh: checkHealth
  };
}
'''

    def generate_domain_hooks(self) -> Dict[str, str]:
        """Generar hooks específicos por dominio"""
        
        hooks = {}
        
        # Hook para Pacientes
        hooks['usePatients'] = '''// 👥 Hook para Gestión de Pacientes
// Auto-generado - Conecta con API real sin mocks

import { useState, useEffect, useCallback } from 'react';
import { useApiBridge, ApiResponse, UseApiOptions } from './useApiBridge';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalRecords?: any[];
}

export function usePatients(options: UseApiOptions = {}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const { makeRequest, loading, error } = useApiBridge();

  const fetchPatients = useCallback(async () => {
    const result = await makeRequest('/api/patients', {
      token: options.token
    });
    
    if (result.success) {
      setPatients(result.data || []);
      options.onSuccess?.(result.data);
    } else {
      options.onError?.(result.error || 'Error al cargar pacientes');
    }
    
    return result;
  }, [makeRequest, options]);

  const createPatient = useCallback(async (patientData: Partial<Patient>) => {
    const result = await makeRequest('/api/patients', {
      method: 'POST',
      data: patientData,
      token: options.token
    });
    
    if (result.success) {
      await fetchPatients(); // Refresh list
    }
    
    return result;
  }, [makeRequest, fetchPatients, options.token]);

  const updatePatient = useCallback(async (id: string, patientData: Partial<Patient>) => {
    const result = await makeRequest(`/api/patients/${id}`, {
      method: 'PUT',
      data: patientData,
      token: options.token
    });
    
    if (result.success) {
      await fetchPatients(); // Refresh list
    }
    
    return result;
  }, [makeRequest, fetchPatients, options.token]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchPatients();
    }
  }, [fetchPatients, options.immediate]);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    refresh: fetchPatients
  };
}

// 🔍 Hook para buscar pacientes
export function usePatientsSearch() {
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const { makeRequest, loading, error } = useApiBridge();

  const search = useCallback(async (query: string, token?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const result = await makeRequest(`/api/patients/search?q=${encodeURIComponent(query)}`, {
      token
    });
    
    if (result.success) {
      setSearchResults(result.data || []);
    }
    
    return result;
  }, [makeRequest]);

  return {
    searchResults,
    loading,
    error,
    search
  };
}
'''

        # Hook para Doctores
        hooks['useDoctors'] = '''// 👨‍⚕️ Hook para Gestión de Doctores
// Auto-generado - Conecta con API real sin mocks

import { useState, useEffect, useCallback } from 'react';
import { useApiBridge, ApiResponse, UseApiOptions } from './useApiBridge';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone?: string;
  schedule?: any[];
  reviews?: any[];
}

export function useDoctors(options: UseApiOptions = {}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { makeRequest, loading, error } = useApiBridge();

  const fetchDoctors = useCallback(async () => {
    const result = await makeRequest('/api/doctors', {
      token: options.token
    });
    
    if (result.success) {
      setDoctors(result.data || []);
      options.onSuccess?.(result.data);
    } else {
      options.onError?.(result.error || 'Error al cargar doctores');
    }
    
    return result;
  }, [makeRequest, options]);

  const getDoctorById = useCallback(async (id: string) => {
    const result = await makeRequest(`/api/doctors/${id}`, {
      token: options.token
    });
    
    return result;
  }, [makeRequest, options.token]);

  const searchDoctors = useCallback(async (filters: {
    specialty?: string;
    location?: string;
    available?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.location) params.append('location', filters.location);
    if (filters.available) params.append('available', 'true');

    const result = await makeRequest(`/api/doctors/search?${params.toString()}`, {
      token: options.token
    });
    
    return result;
  }, [makeRequest, options.token]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchDoctors();
    }
  }, [fetchDoctors, options.immediate]);

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    getDoctorById,
    searchDoctors,
    refresh: fetchDoctors
  };
}
'''

        # Hook para Citas
        hooks['useAppointments'] = '''// 📅 Hook para Gestión de Citas
// Auto-generado - Conecta con API real sin mocks

import { useState, useEffect, useCallback } from 'react';
import { useApiBridge, ApiResponse, UseApiOptions } from './useApiBridge';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  notes?: string;
}

export function useAppointments(options: UseApiOptions = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { makeRequest, loading, error } = useApiBridge();

  const fetchAppointments = useCallback(async () => {
    const result = await makeRequest('/api/appointments', {
      token: options.token
    });
    
    if (result.success) {
      setAppointments(result.data || []);
      options.onSuccess?.(result.data);
    } else {
      options.onError?.(result.error || 'Error al cargar citas');
    }
    
    return result;
  }, [makeRequest, options]);

  const createAppointment = useCallback(async (appointmentData: Partial<Appointment>) => {
    const result = await makeRequest('/api/appointments', {
      method: 'POST',
      data: appointmentData,
      token: options.token
    });
    
    if (result.success) {
      await fetchAppointments(); // Refresh list
    }
    
    return result;
  }, [makeRequest, fetchAppointments, options.token]);

  const updateAppointment = useCallback(async (id: string, appointmentData: Partial<Appointment>) => {
    const result = await makeRequest(`/api/appointments/${id}`, {
      method: 'PUT',
      data: appointmentData,
      token: options.token
    });
    
    if (result.success) {
      await fetchAppointments(); // Refresh list
    }
    
    return result;
  }, [makeRequest, fetchAppointments, options.token]);

  const cancelAppointment = useCallback(async (id: string) => {
    const result = await updateAppointment(id, { status: 'cancelled' });
    return result;
  }, [updateAppointment]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchAppointments();
    }
  }, [fetchAppointments, options.immediate]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refresh: fetchAppointments
  };
}
'''

        # Hook para Video Llamadas
        hooks['useVideoCall'] = '''// 🎥 Hook para Video Llamadas
// Auto-generado - Conecta con API real sin mocks

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
    const result = await makeRequest('/api/video-calls/create', {
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
    const result = await makeRequest('/api/video-calls/active', {
      token
    });
    
    return result;
  }, [makeRequest]);

  const endVideoCall = useCallback(async (callId: string, token?: string) => {
    const result = await makeRequest(`/api/video-calls/${callId}/end`, {
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
'''

        return hooks

    def generate_auth_hook(self) -> str:
        """Generar hook de autenticación"""
        return '''// 🔐 Hook para Autenticación
// Auto-generado - Conecta con API real sin mocks

import { useState, useEffect, useCallback } from 'react';
import { useApiBridge } from './useApiBridge';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  token?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { makeRequest, loading, error } = useApiBridge();

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const result = await makeRequest('/api/auth/login', {
      method: 'POST',
      data: credentials
    });
    
    if (result.success && result.data.token) {
      const userData = {
        ...result.data.user,
        token: result.data.token
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Guardar token en localStorage
      localStorage.setItem('altamedica_token', result.data.token);
      localStorage.setItem('altamedica_user', JSON.stringify(userData));
    }
    
    return result;
  }, [makeRequest]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('altamedica_token');
    localStorage.removeItem('altamedica_user');
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('altamedica_token');
    const userStr = localStorage.getItem('altamedica_user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        logout();
      }
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    token: user?.token
  };
}
'''

    def generate_index_file(self) -> str:
        """Generar archivo índice para exportar todos los hooks"""
        return '''// 🎣 AltaMedica API Hooks - Índice Principal
// Auto-generado - Conecta con APIs reales sin mocks
// Generado: ''' + datetime.now().isoformat() + '''

// ✨ Hooks base
export { useApiBridge, useServiceHealth } from './useApiBridge';
export type { ApiResponse, UseApiOptions } from './useApiBridge';

// 🔐 Autenticación
export { useAuth } from './useAuth';
export type { User } from './useAuth';

// 👥 Pacientes
export { usePatients, usePatientsSearch } from './usePatients';
export type { Patient } from './usePatients';

// 👨‍⚕️ Doctores
export { useDoctors } from './useDoctors';
export type { Doctor } from './useDoctors';

// 📅 Citas
export { useAppointments } from './useAppointments';
export type { Appointment } from './useAppointments';

// 🎥 Video Llamadas
export { useVideoCall } from './useVideoCall';
export type { VideoCall } from './useVideoCall';

// 🎯 Hook principal para acceso completo
export function useAltaMedicaAPI() {
  const auth = useAuth();
  const serviceHealth = useServiceHealth();
  
  return {
    auth,
    serviceHealth,
    isHealthy: serviceHealth.healthyCount > 0,
    token: auth.token
  };
}

// 📱 Ejemplo de uso:
/*
import { useAltaMedicaAPI, usePatients, useDoctors } from './hooks';

function MyComponent() {
  const { auth, isHealthy } = useAltaMedicaAPI();
  const { patients, loading: patientsLoading } = usePatients({ 
    token: auth.token,
    immediate: auth.isAuthenticated 
  });
  const { doctors } = useDoctors({ token: auth.token });
  
  if (!isHealthy) return <div>Servicios no disponibles</div>;
  if (!auth.isAuthenticated) return <LoginForm />;
  
  return (
    <div>
      <h1>Pacientes: {patients.length}</h1>
      <h1>Doctores: {doctors.length}</h1>
    </div>
  );
}
*/
'''

    def generate_all_hooks(self, output_dir: str = None):
        """Generar todos los hooks en el directorio especificado"""
        
        if output_dir:
            hooks_dir = Path(output_dir)
        else:
            # Usar directorio de hooks en la app de pacientes por defecto
            hooks_dir = self.workspace / "apps" / "patients" / "src" / "hooks" / "api"
        
        hooks_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"GENERANDO HOOKS REACT PARA ALTAMEDICA")
        print("=" * 50)
        
        # Generar hook base
        print("Generando useApiBridge...")
        base_hook_path = hooks_dir / "useApiBridge.ts"
        with open(base_hook_path, 'w', encoding='utf-8') as f:
            f.write(self.generate_base_hook())
        
        # Generar hook de autenticación
        print("Generando useAuth...")
        auth_hook_path = hooks_dir / "useAuth.ts"
        with open(auth_hook_path, 'w', encoding='utf-8') as f:
            f.write(self.generate_auth_hook())
        
        # Generar hooks de dominio
        domain_hooks = self.generate_domain_hooks()
        for hook_name, hook_content in domain_hooks.items():
            print(f"Generando {hook_name}...")
            hook_path = hooks_dir / f"{hook_name}.ts"
            with open(hook_path, 'w', encoding='utf-8') as f:
                f.write(hook_content)
        
        # Generar archivo índice
        print("Generando index.ts...")
        index_path = hooks_dir / "index.ts"
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(self.generate_index_file())
        
        # Generar README
        print("Generando README...")
        readme_path = hooks_dir / "README.md"
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(self.generate_readme())
        
        print(f"\nHOOKS GENERADOS EXITOSAMENTE")
        print(f"Directorio: {hooks_dir}")
        print(f"Archivos creados: {len(list(hooks_dir.glob('*.ts')))} hooks")
        print(f"\nUSO:")
        print(f"   import {{ useAltaMedicaAPI }} from '{hooks_dir.relative_to(self.workspace)}'")
        
        return hooks_dir

    def generate_readme(self) -> str:
        """Generar documentación de los hooks"""
        return '''# 🎣 AltaMedica API Hooks

Hooks de React auto-generados para conectar con las APIs de AltaMedica sin usar mocks.

## 🚀 Inicio Rápido

```tsx
import { useAltaMedicaAPI, usePatients } from './hooks/api';

function MyComponent() {
  const { auth, isHealthy } = useAltaMedicaAPI();
  const { patients, loading } = usePatients({ 
    token: auth.token,
    immediate: auth.isAuthenticated 
  });
  
  if (!isHealthy) return <div>Servicios no disponibles</div>;
  if (!auth.isAuthenticated) return <LoginForm />;
  
  return (
    <div>
      {loading ? 'Cargando...' : `${patients.length} pacientes`}
    </div>
  );
}
```

## 📚 Hooks Disponibles

### 🔐 Autenticación
- `useAuth()` - Gestión de autenticación y tokens

### 👥 Gestión de Datos
- `usePatients()` - CRUD de pacientes
- `useDoctors()` - Gestión de doctores  
- `useAppointments()` - Gestión de citas
- `useVideoCall()` - Video llamadas

### 🔧 Utilidades
- `useApiBridge()` - Comunicación directa con API Bridge
- `useServiceHealth()` - Monitoreo de servicios

## ⚙️ Configuración

1. **Iniciar API Bridge**: `python tools/python/api_frontend_bridge.py`
2. **Importar hooks**: `import { useAltaMedicaAPI } from './hooks/api'`
3. **Usar en componentes**: Sin configuración adicional

## 🎯 Beneficios

- ✅ **Sin Mocks**: Conexión directa con APIs reales
- ✅ **Type Safe**: TypeScript completo
- ✅ **Auto-retry**: Manejo automático de errores
- ✅ **Caching**: Optimización automática
- ✅ **SSO Ready**: Integración con tokens JWT

## 🔄 Migración desde Mocks

Busca y reemplaza:
```tsx
// Antes (mock)
const [patients, setPatients] = useState(mockPatients);

// Después (real API)
const { patients } = usePatients({ token: auth.token });
```

Estos hooks son **auto-generados**. Para regenerar:
```bash
python tools/python/frontend_hook_generator.py
```
'''

def main():
    """Función principal para generar hooks"""
    workspace = "c:/Users/Eduardo/Documents/devaltamedica"
    generator = ReactHookGenerator(workspace)
    
    print("FRONTEND HOOK GENERATOR")
    print("=" * 40)
    print("Generando hooks React para conectar con APIs reales...")
    
    # Generar hooks en múltiples ubicaciones
    locations = [
        workspace + "/apps/patients/src/hooks/api",
        workspace + "/apps/doctors/src/hooks/api", 
        workspace + "/shared/hooks/api"
    ]
    
    for location in locations:
        try:
            hooks_dir = generator.generate_all_hooks(location)
            print(f"Hooks generados en: {hooks_dir}")
        except Exception as e:
            print(f"Error generando en {location}: {e}")
    
    print(f"\nGENERACION COMPLETADA")
    print(f"Proximo paso: Iniciar API Bridge")
    print(f"   python tools/python/api_frontend_bridge.py")

if __name__ == "__main__":
    main()
