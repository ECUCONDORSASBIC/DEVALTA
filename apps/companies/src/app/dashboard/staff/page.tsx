'use client';

import { Card } from '@altamedica/ui';
import { UserCheck } from 'lucide-react';

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-16">
        <Card className="max-w-md mx-auto p-8">
          <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vista de Personal Médico</h2>
          <p className="text-gray-600">
            Aquí podrás gestionar todo el personal médico de tu institución, 
            incluyendo doctores, enfermeras y personal administrativo.
          </p>
          <p className="text-sm text-gray-500 mt-4">En desarrollo</p>
        </Card>
      </div>
    </div>
  );
}