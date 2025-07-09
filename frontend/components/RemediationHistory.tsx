'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Remediation {
  resource_id: string;
  strategy: string;
  triggered_at: string;
  success: boolean;
  status: string;
}

interface RemediationHistoryProps {}

export default function RemediationHistory({}: RemediationHistoryProps) {
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRemediations = async () => {
    try {
      const response = await fetch('/api/remediations');
      const data = await response.json();
      setRemediations(data.remediations || []);
    } catch (error) {
      console.error('Error fetching remediations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemediations();
  }, []);

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'restart_instance':
        return 'Restart Instance';
      case 'scale_up':
        return 'Scale Up';
      case 'restart_deployment':
        return 'Restart Deployment';
      default:
        return strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-success-600" />
    ) : (
      <XCircle className="w-4 h-4 text-danger-600" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-success-600 bg-success-50' : 'text-danger-600 bg-danger-50';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Remediation History</h2>
        <button
          onClick={fetchRemediations}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {remediations.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No remediations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Remediation history will appear here when issues are detected and resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {remediations.map((remediation, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(remediation.success)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {remediation.resource_id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(remediation.success)}`}>
                      {remediation.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{getStrategyLabel(remediation.strategy)}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(remediation.triggered_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {remediations.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing last {remediations.length} remediations
          </p>
        </div>
      )}
    </div>
  );
} 