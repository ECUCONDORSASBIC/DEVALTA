import { NextApiRequest, NextApiResponse } from 'next';
import ApiMetricsService from '../../../services/ApiMetricsService';

/**
 * API endpoint para obtener métricas del dashboard
 * GET /api/dashboard/metrics
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir métodos GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    const metricsService = ApiMetricsService.getInstance();
    
    // Obtener parámetros de consulta
    const { category, detailed, export: exportData } = req.query;
    
    // Si se solicita exportación completa
    if (exportData === 'true') {
      const exportedData = metricsService.exportMetrics();
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="api-metrics.json"');
      
      return res.status(200).json(exportedData);
    }
    
    // Obtener métricas del sistema
    const systemMetrics = metricsService.getSystemMetrics();
    
    // Obtener estadísticas de endpoints
    let endpointStats;
    
    if (category && category !== 'all') {
      // Filtrar por categoría específica
      const categorizedStats = metricsService.getEndpointsByCategory();
      endpointStats = categorizedStats[category as string] || [];
    } else {
      // Obtener todos los endpoints
      endpointStats = metricsService.getAllEndpointStats();
    }
    
    // Convertir Set a Array para serialización JSON
    const serializedEndpoints = endpointStats.map(stat => ({
      ...stat,
      consumers: Array.from(stat.consumers)
    }));
    
    // Preparar respuesta
    const response = {
      systemMetrics,
      endpoints: serializedEndpoints,
      meta: {
        timestamp: new Date().toISOString(),
        totalEndpoints: serializedEndpoints.length,
        category: category || 'all',
        detailed: detailed === 'true'
      }
    };
    
    // Si se solicita información detallada, incluir historial
    if (detailed === 'true') {
      const endpointsWithHistory = serializedEndpoints.map(endpoint => ({
        ...endpoint,
        history: metricsService.getEndpointHistory(endpoint.method, endpoint.path)
          .slice(-50) // Últimas 50 métricas para el frontend
      }));
      
      response.endpoints = endpointsWithHistory;
    }
    
    // Configurar headers de cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Configurar CORS para el dashboard
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error retrieving API metrics:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve API metrics',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Configuración de Next.js para este endpoint
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
