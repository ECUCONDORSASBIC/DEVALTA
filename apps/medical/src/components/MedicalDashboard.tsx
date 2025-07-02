'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Users, Calendar, TrendingUp, MapPin, Activity, AlertCircle } from 'lucide-react';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

// Types for dashboard data
interface KPIData {
  totalPatients: number;
  todayAppointments: number;
  pendingResults: number;
  urgentCases: number;
  patientGrowth: number;
  appointmentCompletion: number;
}

interface PatientLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'scheduled' | 'urgent';
  lastVisit: string;
}

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color, suffix = '' }) => {
  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change > 0 ? '↗' : '↘';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}{suffix}
          </p>
          {change !== undefined && (
            <p className={`text-sm font-medium ${getChangeColor(change)} flex items-center mt-1`}>
              <span className="mr-1">{getChangeIcon(change)}</span>
              {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color: color }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientLocationMap: React.FC<{ patients: PatientLocation[] }> = ({ patients }) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return '#EF4444'; // red
      case 'scheduled':
        return '#F59E0B'; // amber
      case 'active':
        return '#10B981'; // green
      default:
        return '#6B7280'; // gray
    }
  };

  const center: [number, number] = patients.length > 0
    ? [
        patients.reduce((sum, p) => sum + p.lat, 0) / patients.length,
        patients.reduce((sum, p) => sum + p.lng, 0) / patients.length,
      ]
    : [40.7128, -74.0060]; // Default to NYC

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {patients.map((patient) => (
          <Marker key={patient.id} position={[patient.lat, patient.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className={`text-sm font-medium ${
                  patient.status === 'urgent' ? 'text-red-600' :
                  patient.status === 'scheduled' ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  Status: {patient.status}
                </p>
                <p className="text-sm text-gray-600">Last visit: {patient.lastVisit}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const MedicalDashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingResults: 0,
    urgentCases: 0,
    patientGrowth: 0,
    appointmentCompletion: 0,
  });

  const [patientLocations, setPatientLocations] = useState<PatientLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API calls for dashboard data
        const kpiResponse = await fetch('/api/dashboard/kpi');
        if (kpiResponse.ok) {
          const kpiData = await kpiResponse.json();
          setKpiData(kpiData);
        } else {
          // Fallback mock data for demo
          setKpiData({
            totalPatients: 1247,
            todayAppointments: 23,
            pendingResults: 7,
            urgentCases: 3,
            patientGrowth: 8.2,
            appointmentCompletion: 94.5,
          });
        }

        const locationsResponse = await fetch('/api/dashboard/patient-locations');
        if (locationsResponse.ok) {
          const locations = await locationsResponse.json();
          setPatientLocations(locations);
        } else {
          // Fallback mock data for demo
          setPatientLocations([
            {
              id: '1',
              name: 'John Doe',
              lat: 40.7589,
              lng: -73.9851,
              status: 'active',
              lastVisit: '2024-07-01',
            },
            {
              id: '2',
              name: 'Jane Smith',
              lat: 40.7505,
              lng: -73.9934,
              status: 'scheduled',
              lastVisit: '2024-06-28',
            },
            {
              id: '3',
              name: 'Bob Johnson',
              lat: 40.7614,
              lng: -73.9776,
              status: 'urgent',
              lastVisit: '2024-06-30',
            },
            {
              id: '4',
              name: 'Alice Brown',
              lat: 40.7382,
              lng: -74.0042,
              status: 'active',
              lastVisit: '2024-07-02',
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set fallback data in case of error
        setKpiData({
          totalPatients: 1247,
          todayAppointments: 23,
          pendingResults: 7,
          urgentCases: 3,
          patientGrowth: 8.2,
          appointmentCompletion: 94.5,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Dashboard</h1>
        <p className="text-gray-600">Overview of patient data and key performance indicators</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Patients"
          value={kpiData.totalPatients}
          change={kpiData.patientGrowth}
          icon={<Users size={24} />}
          color="#3B82F6"
        />
        <KPICard
          title="Today's Appointments"
          value={kpiData.todayAppointments}
          icon={<Calendar size={24} />}
          color="#10B981"
        />
        <KPICard
          title="Pending Results"
          value={kpiData.pendingResults}
          icon={<Activity size={24} />}
          color="#F59E0B"
        />
        <KPICard
          title="Urgent Cases"
          value={kpiData.urgentCases}
          icon={<AlertCircle size={24} />}
          color="#EF4444"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <KPICard
          title="Patient Growth Rate"
          value={kpiData.patientGrowth}
          icon={<TrendingUp size={24} />}
          color="#8B5CF6"
          suffix="%"
        />
        <KPICard
          title="Appointment Completion"
          value={kpiData.appointmentCompletion}
          icon={<Activity size={24} />}
          color="#06B6D4"
          suffix="%"
        />
      </div>

      {/* Charts and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Locations Map */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Patient Locations</h2>
          </div>
          <PatientLocationMap patients={patientLocations} />
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Urgent</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              {
                time: '10:30 AM',
                activity: 'New patient registration',
                patient: 'Maria Garcia',
                type: 'registration',
              },
              {
                time: '09:45 AM',
                activity: 'Lab results uploaded',
                patient: 'Robert Wilson',
                type: 'lab',
              },
              {
                time: '09:15 AM',
                activity: 'Appointment completed',
                patient: 'Sarah Johnson',
                type: 'appointment',
              },
              {
                time: '08:30 AM',
                activity: 'Urgent case flagged',
                patient: 'Michael Davis',
                type: 'urgent',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'urgent' ? 'bg-red-500' :
                  activity.type === 'lab' ? 'bg-blue-500' :
                  activity.type === 'appointment' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                  <p className="text-sm text-gray-600">Patient: {activity.patient}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-center text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
            View all activities →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;
