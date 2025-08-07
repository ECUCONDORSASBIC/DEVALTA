'use client';

import { MarketplaceProvider } from '@/contexts/MarketplaceContext';
import { marketplaceDoctors, marketplaceCompanies } from '@/data/marketplaceData';
import { lazy, Suspense } from 'react';

const JobMarketplaceDashboard = lazy(() => import('@/components/marketplace/JobMarketplaceDashboard'));

export default function MarketplacePage() {
  return (
    <MarketplaceProvider 
      initialDoctors={marketplaceDoctors} 
      initialCompanies={marketplaceCompanies}
    >
      <Suspense fallback={
        <div className="h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="text-sm font-medium text-gray-700">Cargando marketplace médico...</p>
          </div>
        </div>
      }>
        <JobMarketplaceDashboard />
      </Suspense>
    </MarketplaceProvider>
  );
}