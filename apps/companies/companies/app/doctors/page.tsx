'use client';

import { ArrowLeft, Award, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { MOCK_DOCTORS } from '../../lib/mock-data';
import { AppRoutes } from '../../lib/routes';

export default function DoctorsPage(): React.JSX.Element {
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
        <h1 className="text-3xl font-bold text-gray-900">Búsqueda de Médicos</h1>
        <p className="text-gray-600 mt-2">
          Encuentra profesionales médicos calificados para tu organización
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DOCTORS.map(doctor => (
          <div key={doctor.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Dr. {doctor.name}
              </h3>
              <p className="text-blue-600 font-medium">{doctor.specialty}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{doctor.location}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Award className="w-4 h-4 mr-2" />
                <span>{doctor.experience} años de experiencia</span>
              </div>
                <div className="flex items-center text-gray-600">
                <Star className="w-4 h-4 mr-2" />
                <span>Rating: 4.8/5</span>
              </div>            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Especialidad:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {doctor.specialty}
                </span>
              </div>
            </div>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
              Ver Perfil Completo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
