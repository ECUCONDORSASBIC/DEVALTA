export interface ClinicMetrics {
  totalPatients: number;
  activePatients: number;
  totalDoctors: number;
  activeDoctors: number;
  monthlyRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  patientSatisfaction: number;
  averageWaitTime: number;
  bedOccupancyRate: number;
  telemedicineSessions: number;
  emergencyCases: number;
}

export const mockMetrics: ClinicMetrics = {
  totalPatients: 1500,
  activePatients: 1234,
  totalDoctors: 48,
  activeDoctors: 42,
  monthlyRevenue: 125000,
  totalAppointments: 890,
  completedAppointments: 780,
  patientSatisfaction: 4.2,
  averageWaitTime: 25,
  bedOccupancyRate: 78,
  telemedicineSessions: 156,
  emergencyCases: 23,
};