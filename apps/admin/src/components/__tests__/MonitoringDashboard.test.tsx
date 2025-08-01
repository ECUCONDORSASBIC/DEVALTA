import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import MonitoringDashboard from '../MonitoringDashboard';

// Mock de fetch
global.fetch = jest.fn();

// Mock de useAuth
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    },
    token: 'mock-token',
  }),
}));

// Mock de Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-data={JSON.stringify(data)} data-options={JSON.stringify(options)} />
  ),
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart" data-data={JSON.stringify(data)} data-options={JSON.stringify(options)} />
  ),
  Doughnut: ({ data, options }: any) => (
    <div data-testid="doughnut-chart" data-data={JSON.stringify(data)} data-options={JSON.stringify(options)} />
  ),
}));

describe('MonitoringDashboard Component', () => {
  const mockMetrics = {
    totalPatients: 1250,
    totalDoctors: 45,
    totalAppointments: 89,
    activeSessions: 12,
    systemHealth: 98.5,
    responseTime: 245,
    errorRate: 0.2,
    uptime: 99.9,
  };

  const mockAppointments = [
    {
      id: '1',
      patientName: 'Juan Pérez',
      doctorName: 'Dr. Smith',
      date: '2024-01-15',
      time: '10:00',
      status: 'confirmed',
      type: 'in-person',
    },
    {
      id: '2',
      patientName: 'Ana López',
      doctorName: 'Dr. Johnson',
      date: '2024-01-15',
      time: '11:00',
      status: 'in-progress',
      type: 'telemedicine',
    },
  ];

  const mockSystemLogs = [
    {
      id: '1',
      timestamp: '2024-01-15T10:00:00Z',
      level: 'info',
      message: 'Sistema iniciado correctamente',
      service: 'api-server',
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:05:00Z',
      level: 'warning',
      message: 'Alto uso de CPU detectado',
      service: 'monitoring',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de fetch para metrics
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ metrics: mockMetrics }),
    });

    // Mock de fetch para appointments
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ appointments: mockAppointments }),
    });

    // Mock de fetch para system logs
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logs: mockSystemLogs }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard with title', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Panel de Monitoreo')).toBeInTheDocument();
        expect(screen.getByText('Bienvenido, Admin User')).toBeInTheDocument();
      });
    });

    it('should render metrics cards', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Pacientes Totales')).toBeInTheDocument();
        expect(screen.getByText('1,250')).toBeInTheDocument();
        
        expect(screen.getByText('Doctores Activos')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        
        expect(screen.getByText('Citas Hoy')).toBeInTheDocument();
        expect(screen.getByText('89')).toBeInTheDocument();
        
        expect(screen.getByText('Sesiones Activas')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });

    it('should render system health indicators', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Salud del Sistema')).toBeInTheDocument();
        expect(screen.getByText('98.5%')).toBeInTheDocument();
        
        expect(screen.getByText('Tiempo de Respuesta')).toBeInTheDocument();
        expect(screen.getByText('245ms')).toBeInTheDocument();
        
        expect(screen.getByText('Tasa de Error')).toBeInTheDocument();
        expect(screen.getByText('0.2%')).toBeInTheDocument();
        
        expect(screen.getByText('Tiempo Activo')).toBeInTheDocument();
        expect(screen.getByText('99.9%')).toBeInTheDocument();
      });
    });

    it('should render charts', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
      });
    });

    it('should render appointments table', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Citas Recientes')).toBeInTheDocument();
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('Ana López')).toBeInTheDocument();
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Johnson')).toBeInTheDocument();
      });
    });

    it('should render system logs', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Logs del Sistema')).toBeInTheDocument();
        expect(screen.getByText('Sistema iniciado correctamente')).toBeInTheDocument();
        expect(screen.getByText('Alto uso de CPU detectado')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should render navigation tabs', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Resumen')).toBeInTheDocument();
        expect(screen.getByText('Rendimiento')).toBeInTheDocument();
        expect(screen.getByText('Logs')).toBeInTheDocument();
        expect(screen.getByText('Alertas')).toBeInTheDocument();
      });
    });

    it('should switch between tabs', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const performanceTab = screen.getByText('Rendimiento');
        fireEvent.click(performanceTab);
        
        expect(screen.getByText('Métricas de Rendimiento')).toBeInTheDocument();
        expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      });
    });

    it('should show logs tab content', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const logsTab = screen.getByText('Logs');
        fireEvent.click(logsTab);
        
        expect(screen.getByText('Filtrar por Nivel')).toBeInTheDocument();
        expect(screen.getByText('Filtrar por Servicio')).toBeInTheDocument();
      });
    });

    it('should show alerts tab content', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const alertsTab = screen.getByText('Alertas');
        fireEvent.click(alertsTab);
        
        expect(screen.getByText('Configurar Alertas')).toBeInTheDocument();
        expect(screen.getByText('Historial de Alertas')).toBeInTheDocument();
      });
    });
  });

  describe('Data Filtering', () => {
    it('should filter appointments by status', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const statusFilter = screen.getByLabelText('Filtrar por Estado');
        fireEvent.change(statusFilter, { target: { value: 'confirmed' } });
        
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.queryByText('Ana López')).not.toBeInTheDocument();
      });
    });

    it('should filter appointments by type', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const typeFilter = screen.getByLabelText('Filtrar por Tipo');
        fireEvent.change(typeFilter, { target: { value: 'telemedicine' } });
        
        expect(screen.getByText('Ana López')).toBeInTheDocument();
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      });
    });

    it('should filter logs by level', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const logsTab = screen.getByText('Logs');
        fireEvent.click(logsTab);
        
        const levelFilter = screen.getByLabelText('Filtrar por Nivel');
        fireEvent.change(levelFilter, { target: { value: 'warning' } });
        
        expect(screen.getByText('Alto uso de CPU detectado')).toBeInTheDocument();
        expect(screen.queryByText('Sistema iniciado correctamente')).not.toBeInTheDocument();
      });
    });

    it('should filter logs by service', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const logsTab = screen.getByText('Logs');
        fireEvent.click(logsTab);
        
        const serviceFilter = screen.getByLabelText('Filtrar por Servicio');
        fireEvent.change(serviceFilter, { target: { value: 'api-server' } });
        
        expect(screen.getByText('Sistema iniciado correctamente')).toBeInTheDocument();
        expect(screen.queryByText('Alto uso de CPU detectado')).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update metrics in real-time', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument();
      });

      // Simular actualización en tiempo real
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ metrics: { ...mockMetrics, totalPatients: 1255 } }),
      });

      await waitFor(() => {
        expect(screen.getByText('1,255')).toBeInTheDocument();
      });
    });

    it('should show real-time indicators', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Tiempo Real')).toBeInTheDocument();
        expect(screen.getByTestId('real-time-indicator')).toHaveClass('bg-green-500');
      });
    });
  });

  describe('Alert Management', () => {
    it('should display critical alerts', async () => {
      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const alertsTab = screen.getByText('Alertas');
        fireEvent.click(alertsTab);
        
        expect(screen.getByText('Alto uso de CPU detectado')).toBeInTheDocument();
        expect(screen.getByText('warning')).toBeInTheDocument();
      });
    });

    it('should acknowledge alerts', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const alertsTab = screen.getByText('Alertas');
        fireEvent.click(alertsTab);
        
        const acknowledgeButton = screen.getByText('Acknowledged');
        fireEvent.click(acknowledgeButton);
        
        expect(fetch).toHaveBeenCalledWith('/api/alerts/2/acknowledge', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        });
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export metrics report', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const mockCreateObjectURL = jest.fn(() => 'blob:test');
      URL.createObjectURL = mockCreateObjectURL;

      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const exportButton = screen.getByText('Exportar Reporte');
        fireEvent.click(exportButton);
        
        expect(fetch).toHaveBeenCalledWith('/api/monitoring/export', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        });
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle metrics fetch error', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Error al cargar métricas')).toBeInTheDocument();
      });
    });

    it('should handle appointments fetch error', async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ metrics: mockMetrics }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Error al cargar citas')).toBeInTheDocument();
      });
    });

    it('should handle logs fetch error', async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ metrics: mockMetrics }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ appointments: mockAppointments }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      render(<MonitoringDashboard />);
      
      await waitFor(() => {
        const logsTab = screen.getByText('Logs');
        fireEvent.click(logsTab);
        
        expect(screen.getByText('Error al cargar logs')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<MonitoringDashboard />);
      
      expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
    });

    it('should toggle mobile menu', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<MonitoringDashboard />);
      
      const menuButton = screen.getByLabelText('Abrir menú');
      fireEvent.click(menuButton);
      
      expect(screen.getByText('Cerrar menú')).toBeInTheDocument();
    });
  });
}); 