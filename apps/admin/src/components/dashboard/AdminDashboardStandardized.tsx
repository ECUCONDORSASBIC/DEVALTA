// 🏥 DASHBOARD ESTANDARIZADO - ALTAMEDICA
// Versión migrada usando el Medical Design System

'use client';

import React, { useState, useEffect } from 'react';
import { 
  // Importar iconos necesarios
  Users, Calendar, Activity, Shield, Settings, BarChart3 
} from 'lucide-react';

// Importar componentes estandarizados
import { 
  DashboardLayout, 
  DashboardHeader, 
  KPICard, 
  KPISection, 
  MedicalDataTable,
  MedicalButton, 
  MedicalCard, 
  MedicalBadge 
} from '@altamedica/medical-components';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface DashboardData {
  // Definir tipos específicos del dashboard
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const AdminStandardized: React.FC = () => {
  // Estados
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Sidebar items personalizados
  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      active: true
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  // ============================================================================
  // FUNCIONES
  // ============================================================================

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Implementar carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date().toLocaleString('es-ES'));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Implementar logout
    console.log('Logout clicked');
  };

  const handleSettings = () => {
    // Implementar settings
    console.log('Settings clicked');
  };

  const handleRefresh = async () => {
    await loadDashboardData();
  };

  // ============================================================================
  // KPIs ESTANDARIZADOS
  // ============================================================================

  const kpiData = [
    {
      title: 'Métrica 1',
      value: 0,
      change: 0,
      icon: <Users className="h-6 w-6" />,
      color: 'normal' as const,
      trend: 'stable' as const,
      suffix: ''
    }
    // Agregar más KPIs según sea necesario
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DashboardLayout
      userRole="admin"
      title="Admin Dashboard"
      subtitle="Dashboard de admin estandarizado"
      notifications={0}
      onLogout={handleLogout}
      onSettings={handleSettings}
      onRefresh={handleRefresh}
      sidebarItems={sidebarItems}
      showSearch={true}
      showFilters={true}
      compliance={true}
      lastUpdated={lastUpdated}
    >
      {/* KPIs Estándar */}
      <KPISection kpis={kpiData} columns={4} />

      {/* Contenido específico del dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MedicalCard variant="patient" status="normal">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sección 1</h3>
          <p className="text-gray-600">Contenido de la sección 1</p>
        </MedicalCard>

        <MedicalCard variant="appointment" status="normal">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sección 2</h3>
          <p className="text-gray-600">Contenido de la sección 2</p>
        </MedicalCard>
      </div>
    </DashboardLayout>
  );
};

export default AdminStandardized;
