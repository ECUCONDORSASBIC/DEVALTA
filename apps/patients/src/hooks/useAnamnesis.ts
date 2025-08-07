/**
 * Hook useAnamnesis - Altamedica
 * Gestiona el estado y operaciones de anamnesis del paciente
 */

import { useState, useEffect, useCallback } from 'react';
import { anamnesisService, AnamnesisData } from '../services/anamnesis-service';
import { useAuth } from "@altamedica/auth';

interface UseAnamnesisReturn {
  anamnesis: AnamnesisData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  importFromGame: (respuestasJuego: Record<string, any>) => Promise<void>;
  hasAnamnesis: boolean;
  anamnesisQuality: number;
  urgencyLevel: string;
  alerts: string[];
  recommendations: string[];
}

export function useAnamnesis(pacienteId?: string): UseAnamnesisReturn {
  const { authState } = useAuth();
  const [anamnesis, setAnamnesis] = useState<AnamnesisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = pacienteId || authState?.user?.id;

  // Cargar anamnesis
  const loadAnamnesis = useCallback(async () => {
    if (!id || !authState?.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await anamnesisService.obtenerAnamnesis(id, authState.token);
      setAnamnesis(data);
      
    } catch (err) {
      console.error('Error al cargar anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar anamnesis');
    } finally {
      setLoading(false);
    }
  }, [id, authState?.token]);

  // Importar desde el juego
  const importFromGame = useCallback(async (respuestasJuego: Record<string, any>) => {
    if (!id || !authState?.token) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await anamnesisService.importarDesdeJuego(
        respuestasJuego,
        id,
        authState.token
      );
      
      setAnamnesis(data);
      
    } catch (err) {
      console.error('Error al importar anamnesis:', err);
      setError(err instanceof Error ? err.message : 'Error al importar anamnesis');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, authState?.token]);

  // Refrescar datos
  const refresh = useCallback(async () => {
    await loadAnamnesis();
  }, [loadAnamnesis]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadAnamnesis();
  }, [loadAnamnesis]);

  // Valores computados
  const hasAnamnesis = Boolean(anamnesis);
  
  const anamnesisQuality = anamnesis?.validacion?.calidad || 0;
  
  const urgencyLevel = anamnesis?.analisis?.urgencia || 'baja';
  
  const alerts = anamnesis?.analisis?.alertas || [];
  
  const recommendations = anamnesis?.analisis?.recomendaciones || [];

  return {
    anamnesis,
    loading,
    error,
    refresh,
    importFromGame,
    hasAnamnesis,
    anamnesisQuality,
    urgencyLevel,
    alerts,
    recommendations,
  };
} 