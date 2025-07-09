'use client';

import React from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface HealthData {
  system_status: string;
  total_resources: number;
  healthy_resources: number;
  unhealthy_resources: number;
  last_check: string;
}

interface HealthStatusProps {
  data: HealthData;
}

export default function HealthStatus({ data }: HealthStatusProps) {
  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'warning':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'critical':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const healthPercentage = data.total_resources > 0 
    ? Math.round((data.healthy_resources / data.total_resources) * 100)
    : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* System Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">System Status</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{data.system_status}</p>
          </div>
          <div className={`p-3 rounded-full ${getSystemStatusColor(data.system_status)}`}>
            {getSystemStatusIcon(data.system_status)}
          </div>
        </div>
      </div>

      {/* Total Resources */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Resources</p>
            <p className="text-2xl font-bold text-gray-900">{data.total_resources}</p>
          </div>
          <div className="p-3 rounded-full bg-primary-50 text-primary-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Healthy Resources */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Healthy</p>
            <p className="text-2xl font-bold text-success-600">{data.healthy_resources}</p>
          </div>
          <div className="p-3 rounded-full bg-success-50 text-success-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Unhealthy Resources */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Unhealthy</p>
            <p className="text-2xl font-bold text-danger-600">{data.unhealthy_resources}</p>
          </div>
          <div className="p-3 rounded-full bg-danger-50 text-danger-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Health Percentage Bar */}
      <div className="md:col-span-4 card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Overall Health</h3>
          <span className="text-sm font-medium text-gray-600">{healthPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              healthPercentage >= 80 ? 'bg-success-500' :
              healthPercentage >= 60 ? 'bg-warning-500' : 'bg-danger-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {new Date(data.last_check).toLocaleString()}
        </p>
      </div>
    </div>
  );
} 