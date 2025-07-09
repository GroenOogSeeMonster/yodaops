'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Cloud, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddResourceModal from '../components/AddResourceModal';
import ResourceCard from '../components/ResourceCard';
import HealthStatus from '../components/HealthStatus';
import RemediationHistory from '../components/RemediationHistory';

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

interface HealthData {
  system_status: string;
  total_resources: number;
  healthy_resources: number;
  unhealthy_resources: number;
  last_check: string;
}

export default function Dashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    }
  };

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchResources(), fetchHealthData()]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleAddResource = async (resourceData: any) => {
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });

      if (response.ok) {
        toast.success('Resource added successfully');
        setShowAddModal(false);
        fetchResources();
        fetchHealthData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add resource');
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    }
  };

  const handleRemediate = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/remediate/${resourceId}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Remediation triggered successfully');
        setTimeout(() => {
          fetchResources();
          fetchHealthData();
        }, 2000);
      } else {
        toast.error('Failed to trigger remediation');
      }
    } catch (error) {
      console.error('Error triggering remediation:', error);
      toast.error('Failed to trigger remediation');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Resource deleted successfully');
        fetchResources();
        fetchHealthData();
      } else {
        toast.error('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchResources(), fetchHealthData()]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchResources();
      fetchHealthData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'ec2':
        return <Server className="w-5 h-5" />;
      case 'rds':
        return <Database className="w-5 h-5" />;
      case 'eks':
        return <Cloud className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'ec2':
        return 'EC2 Instance';
      case 'rds':
        return 'RDS Database';
      case 'eks':
        return 'EKS Cluster';
      default:
        return type.toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">YodaOps</h1>
                <p className="text-sm text-gray-500">AI-Driven DevOps Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Status */}
        {healthData && <HealthStatus data={healthData} />}

        {/* Resources Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
            <div className="text-sm text-gray-500">
              {resources.length} resource{resources.length !== 1 ? 's' : ''}
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-12">
              <Server className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resources</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first resource.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onRemediate={handleRemediate}
                  onDelete={handleDeleteResource}
                  getResourceIcon={getResourceIcon}
                  getResourceTypeLabel={getResourceTypeLabel}
                />
              ))}
            </div>
          )}
        </div>

        {/* Remediation History */}
        <div className="mt-12">
          <RemediationHistory />
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <AddResourceModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddResource}
        />
      )}
    </div>
  );
} 