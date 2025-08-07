'use client';

import { InvoicesTable } from '@/components/billing/InvoicesTable';

const invoices = [
  { id: 'INV-001', date: '2024-07-15', amount: '$1,250.00', status: 'Pagado' as const },
  { id: 'INV-002', date: '2024-07-20', amount: '$850.50', status: 'Pendiente' as const },
  { id: 'INV-003', date: '2024-06-10', amount: '$2,500.00', status: 'Pagado' as const },
  { id: 'INV-004', date: '2024-05-30', amount: '$500.00', status: 'Vencido' as const },
];

export default function BillingPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
        <p className="text-lg text-gray-600">Gestiona tus facturas y pagos.</p>
      </header>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Historial de Facturas</h2>
        </div>
        <InvoicesTable invoices={invoices} />
      </div>
    </div>
  );
}
