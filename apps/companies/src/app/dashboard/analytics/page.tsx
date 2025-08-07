'use client';

import { Card } from '@altamedica/ui';
import { ChartBar } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-16">
        <Card className="max-w-md mx-auto p-8">
          <ChartBar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vista de Analíticas</h2>
          <p className="text-gray-600">
            Visualiza estadísticas detalladas sobre el rendimiento de tu institución, 
            incluyendo métricas de pacientes, ingresos y eficiencia operativa.
          </p>
          <p className="text-sm text-gray-500 mt-4">En desarrollo</p>
        </Card>
      </div>
    </div>
  );
}