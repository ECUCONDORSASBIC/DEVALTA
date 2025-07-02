'use client';

import React, { useState } from 'react';
import { PatientList, PatientForm, MedicalDashboard } from '../components';

type ActiveTab = 'dashboard' | 'patients' | 'form';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showForm, setShowForm] = useState(false);

  const handlePatientSubmit = (data: any) => {
    console.log('Patient data submitted:', data);
    alert('Patient information saved successfully!');
    setShowForm(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MedicalDashboard />;
      case 'patients':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add New Patient
              </button>
            </div>
            {showForm ? (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">New Patient Form</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕ Close
                  </button>
                </div>
                <PatientForm onSubmit={handlePatientSubmit} />
              </div>
            ) : (
              <PatientList />
            )}
          </div>
        );
      case 'form':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Registration Form</h1>
            <PatientForm onSubmit={handlePatientSubmit} />
          </div>
        );
      default:
        return <MedicalDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">AltaMedica</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('patients')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'patients'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Patients
                </button>
                <button
                  onClick={() => setActiveTab('form')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === 'form'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  New Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderTabContent()}
      </main>
    </div>
  );
}
