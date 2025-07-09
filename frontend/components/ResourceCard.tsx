'use client';

import React from 'react';
import { Trash2, RefreshCw, Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Resource {
  id: string;
  name: string;
  type: 'ec2' | 'rds' | 'eks';
  region: string;
  status: 'healthy' | 'unhealthy';
  last_check: string;
  created_at: string;
  config: any;
}

interface ResourceCardProps {
  resource: Resource;
  onRemediate: (resourceId: string) => void;
  onDelete: (resourceId: string) => void;
  getResourceIcon: (type: string) => React.ReactNode;
  getResourceTypeLabel: (type: string) => string;
}

export default function ResourceCard({
  resource,
  onRemediate,
  onDelete,
  getResourceIcon,
  getResourceTypeLabel,
}: ResourceCardProps) {
  const getStatusColor = (status: string) => {
    return status === 'healthy' ? 'status-healthy' : 'status-unhealthy';
  };

  const getStatusIcon = (status: string) => {
    return status === 'healthy' ? (
      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
    ) : (
      <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
    );
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
            {getResourceIcon(resource.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{resource.name}</h3>
            <p className="text-sm text-gray-500">{getResourceTypeLabel(resource.type)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon(resource.status)}
          <span className={getStatusColor(resource.status)}>
            {resource.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{resource.region}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            Last check: {formatDistanceToNow(new Date(resource.last_check), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Resource Configuration Preview */}
      {resource.config && Object.keys(resource.config).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Configuration</h4>
          <div className="space-y-1">
            {Object.entries(resource.config).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-600">{key}:</span>
                <span className="text-gray-900 font-medium">
                  {typeof value === 'object' ? JSON.stringify(value).slice(0, 20) + '...' : String(value)}
                </span>
              </div>
            ))}
            {Object.keys(resource.config).length > 3 && (
              <div className="text-xs text-gray-500">
                +{Object.keys(resource.config).length - 3} more properties
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => onRemediate(resource.id)}
          disabled={resource.status === 'healthy'}
          className="flex-1 btn-secondary flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Remediate</span>
        </button>
        <button
          onClick={() => onDelete(resource.id)}
          className="btn-danger flex items-center justify-center p-2"
          title="Delete resource"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 