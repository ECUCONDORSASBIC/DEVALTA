'use client';

import { ArrowLeft, Building, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { MOCK_COMPANIES, MOCK_LISTINGS } from '../../lib/mock-data';
import { AppRoutes } from '../../lib/routes';

export default function JobsPage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href={AppRoutes.Home}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Ofertas de Trabajo</h1>
        <p className="text-gray-600 mt-2">
          Encuentra tu próxima oportunidad profesional en el sector médico
        </p>
      </div>

      <div className="grid gap-6">
        {MOCK_LISTINGS.map(listing => {
          const company = MOCK_COMPANIES.find(c => c.id === listing.companyId);
          return (
            <div key={listing.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {listing.jobTitle || listing.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{company?.name || 'Empresa no encontrada'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{listing.location}</span>                  </div>
                  {listing.type && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="capitalize">{listing.type}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {listing.salary && (
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {listing.salary}
                    </div>
                  )}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Ver Detalles
                  </button>
                </div>
              </div>
                {listing.description && (
                <p className="text-gray-700 mb-4">{listing.description}</p>
              )}
              
              {listing.specialty && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Especialidad requerida:</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {listing.specialty}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
