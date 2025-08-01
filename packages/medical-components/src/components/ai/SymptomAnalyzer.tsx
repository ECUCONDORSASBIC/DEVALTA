/**
 * 🧠 ALTAMEDICA SYMPTOM ANALYZER
 * Componente para análisis de síntomas con IA avanzada
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Thermometer,
  Heart,
  Eye,
  Activity,
  Zap
} from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  frequency: string;
}

interface Diagnosis {
  condition: string;
  probability: number;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  redFlags: string[];
}

export const SymptomAnalyzer: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [analysis, setAnalysis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    medicalHistory: '',
    medications: '',
    allergies: ''
  });

  const commonSymptoms = [
    'Dolor de cabeza', 'Fiebre', 'Tos', 'Fatiga', 'Náuseas',
    'Dolor abdominal', 'Dolor de pecho', 'Dificultad para respirar',
    'Mareos', 'Pérdida de apetito', 'Insomnio', 'Ansiedad'
  ];

  const addSymptom = (symptomName: string) => {
    if (symptomName.trim()) {
      const newSymptomObj: Symptom = {
        id: Date.now().toString(),
        name: symptomName,
        severity: 'moderate',
        duration: '1-3 días',
        frequency: 'Constante'
      };
      setSymptoms([...symptoms, newSymptomObj]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const updateSymptom = (id: string, field: keyof Symptom, value: string) => {
    setSymptoms(symptoms.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return;

    setLoading(true);
    
    try {
      // Simular llamada a la API de IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: Diagnosis = {
        condition: 'Migraine',
        probability: 0.85,
        confidence: 0.92,
        urgency: 'medium',
        recommendations: [
          'Descansar en un ambiente tranquilo y oscuro',
          'Tomar analgésicos de venta libre',
          'Evitar alimentos que puedan desencadenar migrañas',
          'Consultar con un médico si los síntomas persisten'
        ],
        redFlags: [
          'Dolor de cabeza muy intenso y repentino',
          'Síntomas neurológicos asociados',
          'Fiebre alta'
        ]
      };
      
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'mild': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Síntomas con IA</h1>
          <p className="text-gray-600">Sistema avanzado de diagnóstico diferencial</p>
        </div>
        <Button onClick={analyzeSymptoms} disabled={symptoms.length === 0 || loading}>
          {loading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Analizar Síntomas
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel de Entrada de Síntomas */}
        <div className="space-y-6">
          
          {/* Información del Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Información del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Edad</label>
                  <Input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    placeholder="Años"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Género</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Historial Médico</label>
                <Textarea
                  value={patientInfo.medicalHistory}
                  onChange={(e) => setPatientInfo({...patientInfo, medicalHistory: e.target.value})}
                  placeholder="Condiciones médicas previas, cirugías, etc."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Medicamentos Actuales</label>
                <Textarea
                  value={patientInfo.medications}
                  onChange={(e) => setPatientInfo({...patientInfo, medications: e.target.value})}
                  placeholder="Medicamentos que está tomando actualmente"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Alergias</label>
                <Textarea
                  value={patientInfo.allergies}
                  onChange={(e) => setPatientInfo({...patientInfo, allergies: e.target.value})}
                  placeholder="Alergias conocidas"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Síntomas Comunes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Síntomas Comunes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {commonSymptoms.map((symptom) => (
                  <Button
                    key={symptom}
                    variant="outline"
                    size="sm"
                    onClick={() => addSymptom(symptom)}
                    className="justify-start"
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agregar Síntoma Personalizado */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Síntoma Personalizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Describir síntoma..."
                  onKeyPress={(e) => e.key === 'Enter' && addSymptom(newSymptom)}
                />
                <Button onClick={() => addSymptom(newSymptom)}>
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Síntomas y Análisis */}
        <div className="space-y-6">
          
          {/* Lista de Síntomas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Síntomas Registrados</span>
                <Badge variant="secondary">{symptoms.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {symptoms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay síntomas registrados</p>
                  <p className="text-sm">Agrega síntomas para comenzar el análisis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {symptoms.map((symptom) => (
                    <div key={symptom.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{symptom.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSymptom(symptom.id)}
                        >
                          ×
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Severidad</label>
                          <select
                            className="w-full p-2 text-sm border rounded"
                            value={symptom.severity}
                            onChange={(e) => updateSymptom(symptom.id, 'severity', e.target.value)}
                          >
                            <option value="mild">Leve</option>
                            <option value="moderate">Moderada</option>
                            <option value="severe">Severa</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Duración</label>
                          <select
                            className="w-full p-2 text-sm border rounded"
                            value={symptom.duration}
                            onChange={(e) => updateSymptom(symptom.id, 'duration', e.target.value)}
                          >
                            <option value="1-3 días">1-3 días</option>
                            <option value="1 semana">1 semana</option>
                            <option value="2-4 semanas">2-4 semanas</option>
                            <option value="Más de 1 mes">Más de 1 mes</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Badge className={getSeverityColor(symptom.severity)}>
                          {symptom.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultados del Análisis */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Resultados del Análisis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Diagnóstico Principal */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Diagnóstico Principal</h4>
                    <Badge className={getUrgencyColor(analysis.urgency)}>
                      {analysis.urgency}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-blue-800">{analysis.condition}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <span className="text-sm text-blue-600">Probabilidad</span>
                      <div className="text-lg font-bold">{(analysis.probability * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-sm text-blue-600">Confianza IA</span>
                      <div className="text-lg font-bold">{(analysis.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* Recomendaciones */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Recomendaciones
                  </h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Red Flags */}
                {analysis.redFlags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      Señales de Alerta
                    </h4>
                    <ul className="space-y-1">
                      {analysis.redFlags.map((flag, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                          <span className="text-red-600 mt-1">⚠</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Programar Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}; 