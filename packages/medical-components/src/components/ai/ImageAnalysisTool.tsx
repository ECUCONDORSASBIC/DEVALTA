/**
 * 🖼️ ALTAMEDICA IMAGE ANALYSIS TOOL
 * Componente para análisis de imágenes médicas con IA
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Image, 
  Upload, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Filter,
  Layers,
  Target,
  Activity
} from 'lucide-react';

interface ImageAnalysis {
  id: string;
  imageUrl: string;
  imageType: 'xray' | 'mri' | 'ct' | 'ultrasound' | 'dermatology';
  status: 'uploading' | 'processing' | 'completed' | 'error';
  findings: string[];
  abnormalities: string[];
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  processingTime: number;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  type: 'normal' | 'abnormal' | 'critical';
}

export const ImageAnalysisTool: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageType, setImageType] = useState<'xray' | 'mri' | 'ct' | 'ultrasound' | 'dermatology'>('xray');
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypes = [
    { value: 'xray', label: 'Radiografía', icon: '🫁' },
    { value: 'mri', label: 'Resonancia Magnética', icon: '🧠' },
    { value: 'ct', label: 'Tomografía Computarizada', icon: '🦴' },
    { value: 'ultrasound', label: 'Ecografía', icon: '👶' },
    { value: 'dermatology', label: 'Dermatología', icon: '🩺' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    
    try {
      // Simular análisis de imagen con IA
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const mockAnalysis: ImageAnalysis = {
        id: Date.now().toString(),
        imageUrl: imagePreview,
        imageType,
        status: 'completed',
        findings: [
          'Pulmones con ventilación normal',
          'No se observan masas pulmonares',
          'Campos pulmonares bien ventilados',
          'Diafragma en posición normal'
        ],
        abnormalities: [
          'Opacidad sutil en lóbulo inferior derecho',
          'Posible atelectasia subsegmentaria'
        ],
        confidence: 0.87,
        urgency: 'medium',
        recommendations: [
          'Considerar tomografía computarizada para mejor caracterización',
          'Seguimiento radiológico en 2-3 semanas',
          'Evaluación clínica complementaria'
        ],
        processingTime: 3.8
      };

      // Simular anotaciones en la imagen
      const mockAnnotations: Annotation[] = [
        {
          id: '1',
          x: 150,
          y: 200,
          width: 80,
          height: 60,
          label: 'Opacidad sutil',
          confidence: 0.87,
          type: 'abnormal'
        },
        {
          id: '2',
          x: 300,
          y: 150,
          width: 120,
          height: 90,
          label: 'Pulmón normal',
          confidence: 0.95,
          type: 'normal'
        }
      ];

      setAnalysis(mockAnalysis);
      setAnnotations(mockAnnotations);
    } catch (error) {
      console.error('Error analyzing image:', error);
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

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'abnormal': return 'border-orange-500 bg-orange-50';
      case 'normal': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Imágenes Médicas</h1>
          <p className="text-gray-600">IA avanzada para interpretación de imágenes médicas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Imagen
          </Button>
          <Button onClick={analyzeImage} disabled={!selectedImage || loading}>
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Image className="h-4 w-4 mr-2" />
                Analizar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel de Control */}
        <div className="space-y-6">
          
          {/* Tipo de Imagen */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Imagen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {imageTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={imageType === type.value ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setImageType(type.value as any)}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controles de Imagen */}
          <Card>
            <CardHeader>
              <CardTitle>Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(1)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAnnotations"
                  checked={showAnnotations}
                  onChange={(e) => setShowAnnotations(e.target.checked)}
                />
                <label htmlFor="showAnnotations" className="text-sm">
                  Mostrar anotaciones
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Confianza IA</span>
                  <span className="font-medium">{(analysis.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tiempo de procesamiento</span>
                  <span className="font-medium">{analysis.processingTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Hallazgos encontrados</span>
                  <span className="font-medium">{analysis.findings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Anomalías detectadas</span>
                  <span className="font-medium">{analysis.abnormalities.length}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visualizador de Imagen */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Visualizador de Imagen</span>
                {selectedImage && (
                  <Badge variant="secondary">
                    {imageType.toUpperCase()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Haz clic para subir una imagen médica</p>
                  <p className="text-sm text-gray-500">Soporta JPG, PNG, DICOM</p>
                </div>
              ) : (
                <div className="relative overflow-hidden border rounded-lg">
                  <div 
                    className="relative overflow-auto"
                    style={{ maxHeight: '500px' }}
                  >
                    <img
                      src={imagePreview}
                      alt="Imagen médica"
                      className="w-full h-auto"
                      style={{ transform: `scale(${zoom})` }}
                    />
                    
                    {/* Anotaciones */}
                    {showAnnotations && annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className={`absolute border-2 ${getAnnotationColor(annotation.type)} rounded cursor-pointer`}
                        style={{
                          left: `${annotation.x}px`,
                          top: `${annotation.y}px`,
                          width: `${annotation.width}px`,
                          height: `${annotation.height}px`,
                          transform: `scale(${zoom})`
                        }}
                        title={`${annotation.label} (${(annotation.confidence * 100).toFixed(1)}%)`}
                      >
                        <div className="absolute -top-6 left-0 bg-white px-2 py-1 rounded text-xs border">
                          {annotation.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.dcm"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resultados del Análisis */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Hallazgos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Hallazgos Normales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.findings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{finding}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Anomalías */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Anomalías Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.abnormalities.length === 0 ? (
                <div className="text-center py-4 text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No se detectaron anomalías</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {analysis.abnormalities.map((abnormality, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <span className="text-sm">{abnormality}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Recomendaciones Clínicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Importante</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Este análisis es una herramienta de apoyo. La interpretación final debe ser realizada por un profesional médico calificado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 