'use client';

import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@altamedica/ui';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Ene', "Consultas": 4000, "Ingresos": 2400 },
  { name: 'Feb', "Consultas": 3000, "Ingresos": 1398 },
  { name: 'Mar', "Consultas": 2000, "Ingresos": 9800 },
  { name: 'Abr', "Consultas": 2780, "Ingresos": 3908 },
  { name: 'May', "Consultas": 1890, "Ingresos": 4800 },
  { name: 'Jun', "Consultas": 2390, "Ingresos": 3800 },
  { name: 'Jul', "Consultas": 3490, "Ingresos": 4300 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Análisis de Datos</h1>
        <p className="text-lg text-gray-600">Visualiza el rendimiento de tu empresa.</p>
      </header>

      <div className="flex justify-end mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
            <SelectItem value="1y">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$125,430</p>
            <p className="text-sm text-green-500">+12% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consultas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,280</p>
            <p className="text-sm text-green-500">+8% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Nuevos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">324</p>
            <p className="text-sm text-red-500">-5% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Satisfacción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">95%</p>
            <p className="text-sm text-gray-500">Estable</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Consultas" fill="#8884d8" />
              <Bar dataKey="Ingresos" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
