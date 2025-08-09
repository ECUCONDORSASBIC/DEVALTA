import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@altamedica/ui';
import {
    Activity,
    Filter,
    Heart,
    MapPin,
    Search,
    TrendingUp,
    UserPlus,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// Componente Progress simple
const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Interfaces para analytics de pacientes
interface PatientMetrics {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  returnRate: number;
  averageAge: number;
  satisfactionScore: number;
  adherenceRate: number;
  churnRate: number;
}

interface PatientTrend {
  date: string;
  newPatients: number;
  activePatients: number;
  totalAppointments: number;
  cancellationRate: number;
}

interface PatientDemographics {
  ageGroup: string;
  count: number;
  percentage: number;
  averageVisits: number;
  retention: number;
}

interface PatientCondition {
  condition: string;
  count: number;
  averageTreatmentDuration: number;
  successRate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PatientEngagement {
  engagementLevel: string;
  count: number;
  averageVisits: number;
  satisfaction: number;
  adherence: number;
}

interface GeographicDistribution {
  location: string;
  count: number;
  distance: number;
  transportTime: number;
}

interface PatientLifecycle {
  stage: string;
  count: number;
  averageDuration: number;
  conversionRate: number;
}

const PatientAnalytics: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Métricas principales de pacientes
  const patientMetrics: PatientMetrics = {
    totalPatients: 3456,
    newPatients: 234,
    activePatients: 2145,
    returnRate: 78.5,
    averageAge: 42.3,
    satisfactionScore: 4.7,
    adherenceRate: 85.2,
    churnRate: 12.8
  };

  // Tendencias de pacientes
  const patientTrends: PatientTrend[] = [
    { date: '2024-01-01', newPatients: 28, activePatients: 1950, totalAppointments: 156, cancellationRate: 8.5 },
    { date: '2024-01-02', newPatients: 31, activePatients: 1975, totalAppointments: 167, cancellationRate: 7.2 },
    { date: '2024-01-03', newPatients: 25, activePatients: 1989, totalAppointments: 143, cancellationRate: 9.1 },
    { date: '2024-01-04', newPatients: 42, activePatients: 2015, totalAppointments: 189, cancellationRate: 6.8 },
    { date: '2024-01-05', newPatients: 35, activePatients: 2034, totalAppointments: 172, cancellationRate: 8.3 },
    { date: '2024-01-06', newPatients: 29, activePatients: 2048, totalAppointments: 134, cancellationRate: 7.9 },
    { date: '2024-01-07', newPatients: 38, activePatients: 2067, totalAppointments: 145, cancellationRate: 6.5 }
  ];

  // Demografía de pacientes
  const patientDemographics: PatientDemographics[] = [
    { ageGroup: '0-17', count: 312, percentage: 9.0, averageVisits: 3.2, retention: 89.5 },
    { ageGroup: '18-25', count: 421, percentage: 12.2, averageVisits: 2.8, retention: 72.1 },
    { ageGroup: '26-35', count: 865, percentage: 25.0, averageVisits: 4.1, retention: 81.3 },
    { ageGroup: '36-45', count: 954, percentage: 27.6, averageVisits: 5.2, retention: 85.7 },
    { ageGroup: '46-55', count: 623, percentage: 18.0, averageVisits: 6.8, retention: 88.9 },
    { ageGroup: '56-65', count: 203, percentage: 5.9, averageVisits: 7.5, retention: 91.2 },
    { ageGroup: '65+', count: 78, percentage: 2.3, averageVisits: 8.9, retention: 94.1 }
  ];

  // Condiciones de pacientes
  const patientConditions: PatientCondition[] = [
    { condition: 'Hipertensión', count: 456, averageTreatmentDuration: 180, successRate: 92.3, riskLevel: 'medium' },
    { condition: 'Diabetes Tipo 2', count: 234, averageTreatmentDuration: 365, successRate: 88.7, riskLevel: 'high' },
    { condition: 'Obesidad', count: 189, averageTreatmentDuration: 270, successRate: 76.4, riskLevel: 'medium' },
    { condition: 'Ansiedad', count: 167, averageTreatmentDuration: 120, successRate: 84.1, riskLevel: 'low' },
    { condition: 'Artritis', count: 145, averageTreatmentDuration: 540, successRate: 79.3, riskLevel: 'medium' },
    { condition: 'Asma', count: 123, averageTreatmentDuration: 365, successRate: 91.5, riskLevel: 'medium' }
  ];

  // Engagement de pacientes
  const patientEngagement: PatientEngagement[] = [
    { engagementLevel: 'Muy Alto', count: 234, averageVisits: 8.5, satisfaction: 4.9, adherence: 96.2 },
    { engagementLevel: 'Alto', count: 567, averageVisits: 6.2, satisfaction: 4.7, adherence: 89.4 },
    { engagementLevel: 'Medio', count: 1234, averageVisits: 4.1, satisfaction: 4.4, adherence: 78.9 },
    { engagementLevel: 'Bajo', count: 789, averageVisits: 2.3, satisfaction: 4.0, adherence: 65.2 },
    { engagementLevel: 'Muy Bajo', count: 345, averageVisits: 1.1, satisfaction: 3.5, adherence: 45.8 }
  ];

  // Distribución geográfica
  const geographicDistribution: GeographicDistribution[] = [
    { location: 'Centro', count: 1234, distance: 2.5, transportTime: 15 },
    { location: 'Norte', count: 867, distance: 8.2, transportTime: 35 },
    { location: 'Sur', count: 654, distance: 12.1, transportTime: 45 },
    { location: 'Este', count: 432, distance: 15.8, transportTime: 52 },
    { location: 'Oeste', count: 269, distance: 18.3, transportTime: 58 }
  ];

  // Ciclo de vida del paciente
  const patientLifecycle: PatientLifecycle[] = [
    { stage: 'Prospecto', count: 456, averageDuration: 7, conversionRate: 68.4 },
    { stage: 'Primera Consulta', count: 312, averageDuration: 1, conversionRate: 89.7 },
    { stage: 'Tratamiento Activo', count: 2145, averageDuration: 180, conversionRate: 85.2 },
    { stage: 'Seguimiento', count: 867, averageDuration: 365, conversionRate: 92.1 },
    { stage: 'Mantenimiento', count: 543, averageDuration: 730, conversionRate: 78.9 }
  ];

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<any>;
    color: string;
    description: string;
  }> = ({ title, value, change, icon: Icon, color, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendingUp className={`h-3 w-3 ${change > 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change)}%
            </span>
            <span>vs período anterior</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics de Pacientes</h2>
          <p className="text-muted-foreground">
            Análisis detallado de la base de pacientes y su comportamiento
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[250px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Pacientes"
          value={patientMetrics.totalPatients.toLocaleString()}
          change={8.2}
          icon={Users}
          color="text-blue-600"
          description="Pacientes registrados en total"
        />
        <MetricCard
          title="Pacientes Nuevos"
          value={patientMetrics.newPatients}
          change={15.7}
          icon={UserPlus}
          color="text-green-600"
          description="Nuevos registros este mes"
        />
        <MetricCard
          title="Tasa de Retorno"
          value={`${patientMetrics.returnRate}%`}
          change={2.3}
          icon={Activity}
          color="text-purple-600"
          description="Pacientes que regresan"
        />
        <MetricCard
          title="Satisfacción"
          value={`${patientMetrics.satisfactionScore}/5`}
          change={0.4}
          icon={Heart}
          color="text-red-600"
          description="Rating promedio de pacientes"
        />
      </div>

      {/* Tabs de análisis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="demographics">Demografía</TabsTrigger>
          <TabsTrigger value="conditions">Condiciones</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="geography">Geografía</TabsTrigger>
          <TabsTrigger value="lifecycle">Ciclo de Vida</TabsTrigger>
        </TabsList>

        {/* Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Pacientes</CardTitle>
                <CardDescription>Evolución de pacientes nuevos y activos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={patientTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="newPatients" fill="#00C49F" name="Nuevos Pacientes" />
                    <Line yAxisId="right" type="monotone" dataKey="activePatients" stroke="#0088FE" strokeWidth={2} name="Pacientes Activos" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores Clave</CardTitle>
                <CardDescription>Métricas de rendimiento principales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasa de Adherencia</span>
                      <span className="text-sm text-muted-foreground">{patientMetrics.adherenceRate}%</span>
                    </div>
                    <Progress value={patientMetrics.adherenceRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasa de Abandono</span>
                      <span className="text-sm text-muted-foreground">{patientMetrics.churnRate}%</span>
                    </div>
                    <Progress value={patientMetrics.churnRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Edad Promedio</span>
                      <span className="text-sm text-muted-foreground">{patientMetrics.averageAge} años</span>
                    </div>
                    <Progress value={(patientMetrics.averageAge / 100) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Cancelaciones</CardTitle>
              <CardDescription>Porcentaje de cancelaciones por día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={patientTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                    formatter={(value: any) => [`${value}%`, 'Tasa de Cancelación']}
                  />
                  <Area type="monotone" dataKey="cancellationRate" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demografía */}
        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Edad</CardTitle>
                <CardDescription>Pacientes por grupos etarios</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patientDemographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'count' ? `${value} pacientes` : `${value}%`,
                        name === 'count' ? 'Total' : 'Porcentaje'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#0088FE" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retención por Edad</CardTitle>
                <CardDescription>Porcentaje de retención por grupo etario</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={patientDemographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Retención']}
                    />
                    <Line type="monotone" dataKey="retention" stroke="#00C49F" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles Demográficos</CardTitle>
              <CardDescription>Estadísticas completas por grupo de edad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {patientDemographics.map((demo, index) => (
                  <Card key={demo.ageGroup} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{demo.ageGroup}</h4>
                      <Badge variant="secondary">{demo.percentage}%</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pacientes:</span>
                        <span className="font-medium">{demo.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Visitas prom:</span>
                        <span className="font-medium">{demo.averageVisits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retención:</span>
                        <span className="font-medium text-green-600">{demo.retention}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Condiciones */}
        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Condiciones Médicas Principales</CardTitle>
              <CardDescription>Distribución de las condiciones más comunes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientConditions.map((condition, index) => (
                  <div key={condition.condition} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <h4 className="font-semibold">{condition.condition}</h4>
                        <Badge className={`text-xs ${getRiskLevelColor(condition.riskLevel)}`}>
                          {condition.riskLevel === 'low' ? 'Bajo Riesgo' : 
                           condition.riskLevel === 'medium' ? 'Riesgo Medio' : 'Alto Riesgo'}
                        </Badge>
                      </div>
                      <Badge variant="outline">{condition.count} pacientes</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Duración tratamiento</p>
                        <p className="font-medium">{condition.averageTreatmentDuration} días</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tasa de éxito</p>
                        <p className="font-medium text-green-600">{condition.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total pacientes</p>
                        <p className="font-medium">{condition.count}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={condition.successRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Niveles de Engagement</CardTitle>
                <CardDescription>Distribución del compromiso de pacientes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={patientEngagement}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ engagementLevel, count }) => `${engagementLevel}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {patientEngagement.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement vs Satisfacción</CardTitle>
                <CardDescription>Correlación entre compromiso y satisfacción</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={patientEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="averageVisits" name="Visitas Promedio" />
                    <YAxis dataKey="satisfaction" name="Satisfacción" domain={[3, 5]} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'satisfaction' ? `${value}/5` : value,
                        name === 'satisfaction' ? 'Satisfacción' : 'Visitas Promedio'
                      ]}
                    />
                    <Scatter dataKey="satisfaction" fill="#00C49F" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Engagement</CardTitle>
              <CardDescription>Métricas por nivel de compromiso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientEngagement.map((engagement, index) => (
                  <div key={engagement.engagementLevel} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <h4 className="font-semibold">{engagement.engagementLevel}</h4>
                      </div>
                      <Badge variant="secondary">{engagement.count} pacientes</Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Visitas promedio</p>
                        <p className="font-medium">{engagement.averageVisits}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Satisfacción</p>
                        <p className="font-medium">{engagement.satisfaction}/5</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Adherencia</p>
                        <p className="font-medium">{engagement.adherence}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">{engagement.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geografía */}
        <TabsContent value="geography" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución Geográfica</CardTitle>
                <CardDescription>Pacientes por ubicación</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={geographicDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="location" type="category" />
                    <Tooltip 
                      formatter={(value: any) => [`${value} pacientes`, 'Total']}
                    />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distancia vs Tiempo de Transporte</CardTitle>
                <CardDescription>Análisis de accesibilidad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={geographicDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="distance" name="Distancia (km)" />
                    <YAxis dataKey="transportTime" name="Tiempo (min)" />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'distance' ? `${value} km` : `${value} min`,
                        name === 'distance' ? 'Distancia' : 'Tiempo transporte'
                      ]}
                    />
                    <Scatter dataKey="transportTime" fill="#FFBB28" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ubicaciones</CardTitle>
              <CardDescription>Detalles por zona geográfica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geographicDistribution.map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <div>
                        <h4 className="font-semibold">{location.location}</h4>
                        <p className="text-sm text-muted-foreground">{location.count} pacientes</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{location.distance} km</p>
                      <p className="text-muted-foreground">{location.transportTime} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ciclo de Vida */}
        <TabsContent value="lifecycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ciclo de Vida del Paciente</CardTitle>
              <CardDescription>Flujo y conversión en cada etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={patientLifecycle}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#0088FE" name="Cantidad de Pacientes" />
                  <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#FF8042" strokeWidth={2} name="Tasa de Conversión %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {patientLifecycle.map((stage, index) => (
              <Card key={stage.stage}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{stage.stage}</CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {stage.conversionRate}% conversión
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stage.count}</div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Duración promedio</span>
                      <span>{stage.averageDuration} días</span>
                    </div>
                    <Progress value={stage.conversionRate} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientAnalytics;
