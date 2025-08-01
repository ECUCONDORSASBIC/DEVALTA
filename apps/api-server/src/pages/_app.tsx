import { AppProps } from 'next/app';
import { useEffect } from 'react';
import ApiMetricsService from '../services/ApiMetricsService';

// Importar estilos globales
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  // Inicializar el servicio de métricas al cargar la aplicación
  useEffect(() => {
    // Generar algunas métricas de ejemplo para el dashboard
    const metricsService = ApiMetricsService.getInstance();
    
    // Simulación de datos para demonstración
    const generateMockMetrics = () => {
      const endpoints = [
        { method: 'GET', path: '/api/v1/doctors' },
        { method: 'POST', path: '/api/v1/patients' },
        { method: 'GET', path: '/api/v1/appointments' },
        { method: 'POST', path: '/api/v1/notifications/send' },
        { method: 'GET', path: '/api/v1/notifications/history' },
        { method: 'GET', path: '/api/v1/jobs' },
        { method: 'GET', path: '/api/v1/analytics/usage' }
      ];
      
      endpoints.forEach(endpoint => {
        // Generar múltiples métricas por endpoint
        for (let i = 0; i < Math.random() * 100 + 50; i++) {
          const now = new Date();
          const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
          
          metricsService.recordMetric({
            endpoint: endpoint.path,
            method: endpoint.method,
            statusCode: Math.random() > 0.95 ? 500 : (Math.random() > 0.85 ? 404 : 200),
            responseTime: Math.round(Math.random() * 1000 + 50),
            timestamp,
            userAgent: getRandomUserAgent(),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userId: `user_${Math.floor(Math.random() * 1000)}`
          });
        }
      });
    };
    
    // Generar datos mock una sola vez
    if (typeof window !== 'undefined' && !window.localStorage.getItem('metrics-initialized')) {
      generateMockMetrics();
      window.localStorage.setItem('metrics-initialized', 'true');
    }
    
    // Generar nuevas métricas cada minuto para simular actividad
    const interval = setInterval(() => {
      const endpoints = [
        { method: 'GET', path: '/api/v1/doctors' },
        { method: 'POST', path: '/api/v1/patients' },
        { method: 'GET', path: '/api/v1/appointments' }
      ];
      
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      
      metricsService.recordMetric({
        endpoint: randomEndpoint.path,
        method: randomEndpoint.method,
        statusCode: Math.random() > 0.9 ? 500 : 200,
        responseTime: Math.round(Math.random() * 500 + 100),
        timestamp: new Date(),
        userAgent: getRandomUserAgent(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userId: `user_${Math.floor(Math.random() * 1000)}`
      });
    }, 10000); // Cada 10 segundos
    
    return () => clearInterval(interval);
  }, []);

  return <Component {...pageProps} />;
}

// Función auxiliar para generar User-Agents aleatorios
function getRandomUserAgent(): string {
  const userAgents = [
    'altamedica-mobile/1.0.0 (iOS 15.0)',
    'altamedica-web/2.1.0 (Chrome/91.0)',
    'altamedica-admin/1.5.0 (Firefox/89.0)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'PostmanRuntime/7.28.0',
    'insomnia/2021.4.1',
    'curl/7.68.0',
    'Python/3.9 requests/2.25.1'
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export default MyApp;
