/**
 * 🤖 ALTAMEDICA MEDICAL AI DASHBOARD
 * Dashboard completo para sistema de IA médica avanzada
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Microscope, 
  MessageSquare, 
  Image, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  Shield,
  Users
} from 'lucide-react';

interface AIAnalysis {
  id: string;
  type: 'symptoms' | 'image' | 'lab' | 'prediction' | 'chatbot';
  status: 'processing' | 'completed' | 'error';
  confidence: number;
  timestamp: string;
  results: any;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

interface AIMetrics {
  totalAnalyses: number;
  averageConfidence: number;
  highConfidenceAnalyses: number;
  emergencyAlerts: number;
  processingTime: number;
  accuracy: number;
}

export const MedicalAIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentAnalyses, setRecentAnalyses] = useState<AIAnalysis[]>([]);
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalAnalyses: 0,
    averageConfidence: 0,
    highConfidenceAnalyses: 0,
    emergencyAlerts: 0,
    processingTime: 0,
    accuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos de IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRecentAnalyses([
        {
          id: '1',
          type: 'symptoms',
          status: 'completed',
          confidence: 0.92,
          timestamp: new Date().toISOString(),
          results: { diagnosis: 'Migraine', probability: 0.85 },
          urgency: 'medium'
        },
        {
          id: '2',
          type: 'image',
          status: 'completed',
          confidence: 0.88,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          results: { findings: ['Normal chest X-ray'], abnormalities: [] },
          urgency: 'low'
        },
        {
          id: '3',
          type: 'lab',
          status: 'completed',
          confidence: 0.95,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          results: { abnormalities: ['Elevated cholesterol'], riskLevel: 'medium' },
          urgency: 'medium'
        },
        {
          id: '4',
          type: 'prediction',
          status: 'processing',
          confidence: 0,
          timestamp: new Date().toISOString(),
          results: {},
          urgency: 'low'
        }
      ]);

      setMetrics({
        totalAnalyses: 1247,
        averageConfidence: 0.89,
        highConfidenceAnalyses: 1123,
        emergencyAlerts: 8,
        processingTime: 3.2,
        accuracy: 0.94,
      });

    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'symptoms': return <Brain className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'lab': return <Microscope className="h-5 w-5" />;
      case 'prediction': return <TrendingUp className="h-5 w-5" />;
      case 'chatbot': return <MessageSquare className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando sistema de IA médica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de IA Médica</h1>
          <p className="text-gray-600">Sistema avanzado de inteligencia artificial para apoyo médico</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Nueva Análisis
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Análisis</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAnalyses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confianza Promedio</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.averageConfidence * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.highConfidenceAnalyses} análisis de alta confianza
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.processingTime}s</div>
            <p className="text-xs text-muted-foreground">
              Tiempo de procesamiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emergencyAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Funcionalidades */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="symptoms">Análisis de Síntomas</TabsTrigger>
          <TabsTrigger value="images">Análisis de Imágenes</TabsTrigger>
          <TabsTrigger value="lab">Análisis de Laboratorio</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot Médico</TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Análisis Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.slice(0, 5).map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAnalysisIcon(analysis.type)}
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {analysis.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(analysis.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(analysis.status)}
                        <Badge className={getUrgencyColor(analysis.urgency)}>
                          {analysis.urgency}
                        </Badge>
                        {analysis.confidence > 0 && (
                          <span className="text-sm font-medium">
                            {(analysis.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Precisión General</span>
                      <span>{(metrics.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.accuracy * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Análisis de Alta Confianza</span>
                      <span>{((metrics.highConfidenceAnalyses / metrics.totalAnalyses) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(metrics.highConfidenceAnalyses / metrics.totalAnalyses) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tiempo de Respuesta</span>
                      <span>{metrics.processingTime}s</span>
                    </div>
                    <Progress value={(5 - metrics.processingTime) / 5 * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas Activas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Alertas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Valores Críticos</span>
                  </div>
                  <p className="text-sm text-red-700">3 pacientes con valores de laboratorio críticos</p>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Hallazgos Anormales</span>
                  </div>
                  <p className="text-sm text-orange-700">5 imágenes con hallazgos que requieren revisión</p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Predicciones de Riesgo</span>
                  </div>
                  <p className="text-sm text-yellow-700">2 pacientes con predicciones de alto riesgo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Análisis de Síntomas */}
        <TabsContent value="symptoms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análisis de Síntomas con IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Funcionalidades</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Diagnóstico diferencial automático</li>
                    <li>• Análisis de patrones de síntomas</li>
                    <li>• Recomendaciones de tratamiento</li>
                    <li>• Identificación de red flags</li>
                    <li>• Predicción de evolución</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Análisis realizados</span>
                      <span className="font-medium">847</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precisión promedio</span>
                      <span className="font-medium">91.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo promedio</span>
                      <span className="font-medium">2.8s</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Análisis de Imágenes */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Análisis de Imágenes Médicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Tipos de Imágenes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Radiografías</h4>
                      <p className="text-sm text-gray-600">Análisis de rayos X</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Resonancia</h4>
                      <p className="text-sm text-gray-600">Análisis de MRI</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Tomografía</h4>
                      <p className="text-sm text-gray-600">Análisis de CT</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Ecografía</h4>
                      <p className="text-sm text-gray-600">Análisis de US</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Rendimiento</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Imágenes procesadas</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detección de anomalías</span>
                      <span className="font-medium">94.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Falsos positivos</span>
                      <span className="font-medium">2.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Análisis de Laboratorio */}
        <TabsContent value="lab" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Análisis de Laboratorio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Capacidades</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Interpretación automática de resultados</li>
                    <li>• Análisis de tendencias temporales</li>
                    <li>• Detección de valores anormales</li>
                    <li>• Recomendaciones clínicas</li>
                    <li>• Alertas de valores críticos</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Métricas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Resultados analizados</span>
                      <span className="font-medium">5,678</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precisión de interpretación</span>
                      <span className="font-medium">96.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alertas generadas</span>
                      <span className="font-medium">89</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Chatbot */}
        <TabsContent value="chatbot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chatbot Médico Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Funcionalidades</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Respuestas médicas en tiempo real</li>
                    <li>• Evaluación de urgencia</li>
                    <li>• Recomendaciones personalizadas</li>
                    <li>• Integración con historial médico</li>
                    <li>• Soporte multiidioma</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Conversaciones</span>
                      <span className="font-medium">2,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Satisfacción del usuario</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo de respuesta</span>
                      <span className="font-medium">1.8s</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 