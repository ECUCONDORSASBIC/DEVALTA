'use client';

import { ArrowLeft, Building, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppRoutes, AppRoutesHelpers } from '../../lib/routes';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/companies')
      .then(async (res) => {
        if (!res.ok) throw new Error('Error al cargar empresas');
        return res.json();
      })
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <Link 
          href={AppRoutes.Home}
          className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Directorio de Empresas</h1>
        <p className="mt-2 text-gray-600">
          Organizaciones del sector salud que están contratando personal médico
        </p>
      </div>

      {loading && <div className="text-center text-gray-500">Cargando empresas...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        {companies.map(company => (
          <div key={company.id} className="p-6 transition-shadow bg-white rounded-lg shadow-lg hover:shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-16 h-16 mr-4 bg-blue-100 rounded-lg">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold text-gray-900">
                    {company.name}
                  </h3>
                  <p className="font-medium text-blue-600">{company.industry || 'Sector Salud'}</p>
                </div>
              </div>
            </div>

            <p className="mb-4 text-gray-700 line-clamp-3">
              {company.description}
            </p>

            <div className="mb-4 space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{company.size || 'No especificado'} empleados</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={AppRoutesHelpers.CompanyProfile(company.id)}
                className="flex-1 px-4 py-2 font-medium text-center text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Ver Perfil
              </Link>
              <button className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                Ver Ofertas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
