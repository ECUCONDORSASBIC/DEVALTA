'use client';

import React, { useState } from 'react';
import { useAuth, useUserPermissions } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { User, Mail, Phone, Calendar, Shield, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/navigation/Footer';

const ProfilePage = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const { isPatient, isDoctor, isCompany } = useUserPermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    dateOfBirth: userProfile?.dateOfBirth || '',
    gender: userProfile?.gender || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AuthGuard requireAuth={true}>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    {userProfile?.photoURL ? (
                      <img 
                        src={userProfile.photoURL} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:bg-gray-100">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </h2>
                  <p className="text-blue-100 capitalize">{userProfile?.role}</p>
                  <p className="text-sm text-blue-200 mt-1">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 pl-10 border rounded-lg bg-gray-100"
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de nacimiento
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Género
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Guardar cambios
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Editar perfil
                    </Button>
                  )}
                </div>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información de cuenta
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Verificación de email</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      user?.emailVerified ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {user?.emailVerified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Autenticación de dos factores</span>
                    </div>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      Configurar
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">Miembro desde</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role-specific sections */}
              {isDoctor() && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Información profesional
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Licencia médica</p>
                      <p className="font-medium">{userProfile?.medicalLicense || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Especialidad</p>
                      <p className="font-medium">{userProfile?.specialty || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </AuthGuard>
  );
};

export default ProfilePage;