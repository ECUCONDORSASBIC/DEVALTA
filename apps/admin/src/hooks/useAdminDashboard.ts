/**
 * Hook personalizado para Dashboard Administrativo
 * Gestión de estado, datos en tiempo real y funciones administrativas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseService } from '@/services/firebase-service';
import { adminService, AdminStats, AdminUser, SystemHealth, AuditLog } from '@/services/admin-service';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'doctor' | 'patient' | 'company';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  criticalAlerts: number;
  systemUptime: string;
  recentActivity: number;
}

interface SystemHealth {
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  issues: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
}

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UseAdminDashboardReturn {
  // Estados de datos
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Datos del dashboard
  stats: Stats;
  recentUsers: User[];
  systemHealth: SystemHealth;
  auditLogs: AuditLog[];
  
  // Estados de UI
  selectedView: string;
  showNotifications: boolean;
  
  // Acciones
  refreshDashboard: () => void;
  setSelectedView: (view: string) => void;
  toggleNotifications: () => void;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  viewAuditLog: (logId: string) => void;
  exportReport: (type: string) => Promise<void>;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  // Estados principales
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de datos
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    criticalAlerts: 0,
    systemUptime: '0%',
    recentActivity: 0
  });
  
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'UNKNOWN',
    uptime: '0%',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    issues: []
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Estados de UI
  const [selectedView, setSelectedView] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  /**
   * Inicializar autenticación y cargar datos
   */
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
        
        // Verificar si Firebase está inicializado
        if (!firebaseService.isReady) {
          console.warn('Firebase no inicializado. Configure las credenciales.');
        }
        
        // Configurar listener de autenticación
        const unsubscribe = onAuthStateChanged(
          firebaseService.authentication,
          async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
              // Verificar si el usuario es administrador
              const isAdmin = await verifyAdminRole(firebaseUser.uid);
              if (isAdmin) {
                await loadDashboardData();
              } else {
                setError('Acceso denegado. Se requieren permisos de administrador.');
              }
            } else {
              resetDashboardData();
            }
            
            setIsLoading(false);
          }
        );
        
        return () => unsubscribe();
        
      } catch (err) {
        console.error('Error inicializando dashboard administrativo:', err);
        setError('Error al inicializar el dashboard administrativo');
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  /**
   * Verificar si el usuario tiene rol de administrador
   */
  const verifyAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const userDoc = await firebaseService.firestore
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        return userData?.role === 'ADMIN' || userData?.isAdmin === true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando rol de administrador:', error);
      return false;
    }
  };

  /**
   * Cargar todos los datos del dashboard
   */
  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Cargar datos en paralelo
      const [
        statsData,
        usersData,
        healthData,
        logsData
      ] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getRecentUsers(),
        adminService.getSystemHealth(),
        adminService.getAuditLogs()
      ]);

      // Procesar resultados
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (usersData.status === 'fulfilled') setRecentUsers(usersData.value);
      if (healthData.status === 'fulfilled') setSystemHealth(healthData.value);
      if (logsData.status === 'fulfilled') setAuditLogs(logsData.value);
      
    } catch (err) {
      console.error('Error cargando datos del dashboard administrativo:', err);
      setError('Error al cargar los datos del dashboard');
    }
  };

  /**
   * Refrescar dashboard
   */
  const refreshDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simular refresh de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        recentActivity: Math.floor(Math.random() * 200) + 100
      }));
      
    } catch (err) {
      setError('Error al actualizar dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar rol de usuario
   */
  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      // Simular actualización de rol
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecentUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: role as any }
            : user
        )
      );
      
      // Agregar log de auditoría
      setAuditLogs(prev => [
        {
          id: Date.now().toString(),
          action: 'USER_ROLE_UPDATE',
          userId,
          userEmail: recentUsers.find(u => u.id === userId)?.email || '',
          timestamp: new Date().toISOString(),
          details: `Rol actualizado a ${role}`,
          ipAddress: '192.168.1.100',
          severity: 'medium'
        },
        ...prev
      ]);
      
    } catch (err) {
      setError('Error al actualizar rol de usuario');
    }
  }, [recentUsers]);

  /**
   * Suspender usuario
   */
  const suspendUser = useCallback(async (userId: string) => {
    try {
      // Simular suspensión de usuario
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecentUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'suspended' as const }
            : user
        )
      );
      
      // Agregar log de auditoría
      setAuditLogs(prev => [
        {
          id: Date.now().toString(),
          action: 'USER_SUSPENDED',
          userId,
          userEmail: recentUsers.find(u => u.id === userId)?.email || '',
          timestamp: new Date().toISOString(),
          details: 'Usuario suspendido por administrador',
          ipAddress: '192.168.1.100',
          severity: 'high'
        },
        ...prev
      ]);
      
    } catch (err) {
      setError('Error al suspender usuario');
    }
  }, [recentUsers]);

  /**
   * Activar usuario
   */
  const activateUser = useCallback(async (userId: string) => {
    try {
      // Simular activación de usuario
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecentUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'active' as const }
            : user
        )
      );
      
      // Agregar log de auditoría
      setAuditLogs(prev => [
        {
          id: Date.now().toString(),
          action: 'USER_ACTIVATED',
          userId,
          userEmail: recentUsers.find(u => u.id === userId)?.email || '',
          timestamp: new Date().toISOString(),
          details: 'Usuario reactivado por administrador',
          ipAddress: '192.168.1.100',
          severity: 'medium'
        },
        ...prev
      ]);
      
    } catch (err) {
      setError('Error al activar usuario');
    }
  }, [recentUsers]);

  /**
   * Ver log de auditoría
   */
  const viewAuditLog = useCallback((logId: string) => {
    // Simular vista de log de auditoría
    const log = auditLogs.find(l => l.id === logId);
    if (log) {
      console.log('Viendo log de auditoría:', log);
      // Aquí se podría abrir un modal o navegar a una página de detalles
    }
  }, [auditLogs]);

  /**
   * Exportar reporte
   */
  const exportReport = useCallback(async (type: string) => {
    try {
      // Simular exportación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Exportando reporte de tipo: ${type}`);
      
      // Simular descarga
      const blob = new Blob(['Reporte generado'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${type}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Error al exportar reporte');
    }
  }, []);

  /**
   * Resetear datos del dashboard
   */
  const resetDashboardData = () => {
    setStats({
      totalUsers: 0,
      activeUsers: 0,
      pendingApprovals: 0,
      criticalAlerts: 0,
      systemUptime: '0%',
      recentActivity: 0
    });
    setRecentUsers([]);
    setSystemHealth({
      status: 'UNKNOWN',
      uptime: '0%',
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      issues: []
    });
    setAuditLogs([]);
  };

  // Acciones de UI
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  return {
    // Estados de datos
    user,
    isLoading,
    error,
    stats,
    recentUsers,
    systemHealth,
    auditLogs,
    
    // Estados de UI
    selectedView,
    showNotifications,
    
    // Acciones
    refreshDashboard,
    setSelectedView,
    toggleNotifications,
    updateUserRole,
    suspendUser,
    activateUser,
    viewAuditLog,
    exportReport
  };
}; 