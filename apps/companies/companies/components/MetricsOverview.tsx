'use client';

import React from 'react';
import { Card } from './ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Clock, 
  Target, 
  Users,
  type LucideIcon
} from 'lucide-react';

interface MetricItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: LucideIcon;
  color: string;
}

const MetricCard: React.FC<MetricItem> = ({ label, value, change, icon: Icon, color }) => {
  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
        
        {change && (
          <div className={`flex items-center text-sm ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">{change.value}%</span>
            <span className="text-gray-500 ml-1">{change.period}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function MetricsOverview() {
  const metrics: MetricItem[] = [
    {
      label: 'Profile Views',
      value: '2,847',
      change: {
        value: 12,
        type: 'increase',
        period: 'vs last week'
      },
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      label: 'Avg. Time to Hire',
      value: '18 days',
      change: {
        value: 5,
        type: 'decrease',
        period: 'vs last month'
      },
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      label: 'Application Rate',
      value: '24%',
      change: {
        value: 8,
        type: 'increase',
        period: 'vs last month'
      },
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      label: 'Active Candidates',
      value: 156,
      change: {
        value: 15,
        type: 'increase',
        period: 'vs last week'
      },
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const performanceData = {
    totalJobViews: 12847,
    applicationsReceived: 3089,
    interviewsScheduled: 847,
    hiresMade: 23,
    conversionRate: 24.1
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card className="divide-y divide-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
        </div>
        
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </Card>

      {/* Performance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month&apos;s Performance</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Job Views</span>
            <span className="text-sm font-medium text-gray-900">
              {performanceData.totalJobViews.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Applications</span>
            <span className="text-sm font-medium text-gray-900">
              {performanceData.applicationsReceived.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Interviews</span>
            <span className="text-sm font-medium text-gray-900">
              {performanceData.interviewsScheduled}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hires</span>
            <span className="text-sm font-medium text-gray-900">
              {performanceData.hiresMade}
            </span>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Conversion Rate</span>
              <span className="text-sm font-semibold text-green-600">
                {performanceData.conversionRate}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${performanceData.conversionRate}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">4.8</div>
            <div className="text-xs text-gray-500">Company Rating</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="text-xs text-gray-500">Response Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-xs text-gray-500">Open Positions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">3.2k</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
