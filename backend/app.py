import os
import json
import yaml
import random
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
api = Api(app)

# In-memory storage for resources (replace with database in production)
resources = {}
health_status = {}
remediation_history = []

# Load initial resources from YAML
def load_resources_from_yaml():
    """Load resources from YAML configuration file"""
    try:
        yaml_path = os.path.join(os.path.dirname(__file__), 'config', 'resources.yaml')
        if os.path.exists(yaml_path):
            with open(yaml_path, 'r') as file:
                data = yaml.safe_load(file)
                for resource in data.get('resources', []):
                    resource_id = resource['id']
                    resources[resource_id] = {
                        'id': resource_id,
                        'name': resource['name'],
                        'type': resource['type'],
                        'region': resource['region'],
                        'status': 'healthy',
                        'last_check': datetime.now().isoformat(),
                        'created_at': datetime.now().isoformat(),
                        'config': resource.get('config', {})
                    }
                    health_status[resource_id] = {
                        'status': 'healthy',
                        'last_check': datetime.now().isoformat(),
                        'failure_count': 0
                    }
            logger.info(f"Loaded {len(resources)} resources from YAML")
    except Exception as e:
        logger.error(f"Error loading resources from YAML: {e}")

# Health check simulation
def simulate_health_check():
    """Simulate health checks for all resources with 10% failure rate"""
    while True:
        try:
            for resource_id, resource in resources.items():
                # Simulate 10% failure rate
                is_healthy = random.random() > 0.1
                
                if is_healthy:
                    status = 'healthy'
                    health_status[resource_id]['failure_count'] = 0
                else:
                    status = 'unhealthy'
                    health_status[resource_id]['failure_count'] += 1
                
                # Update resource status
                resource['status'] = status
                resource['last_check'] = datetime.now().isoformat()
                health_status[resource_id]['status'] = status
                health_status[resource_id]['last_check'] = datetime.now().isoformat()
                
                # Trigger remediation if unhealthy
                if status == 'unhealthy' and health_status[resource_id]['failure_count'] >= 2:
                    trigger_remediation(resource_id)
                
                logger.info(f"Health check for {resource_id}: {status}")
            
            time.sleep(30)  # Check every 30 seconds
        except Exception as e:
            logger.error(f"Error in health check simulation: {e}")
            time.sleep(30)

def trigger_remediation(resource_id):
    """Trigger remediation for a resource"""
    try:
        resource = resources.get(resource_id)
        if not resource:
            return
        
        remediation_strategy = get_remediation_strategy(resource['type'])
        
        # Simulate remediation
        success = random.random() > 0.2  # 80% success rate
        
        remediation_record = {
            'resource_id': resource_id,
            'strategy': remediation_strategy,
            'triggered_at': datetime.now().isoformat(),
            'success': success,
            'status': 'completed' if success else 'failed'
        }
        
        remediation_history.append(remediation_record)
        
        if success:
            resource['status'] = 'healthy'
            health_status[resource_id]['status'] = 'healthy'
            health_status[resource_id]['failure_count'] = 0
        
        logger.info(f"Remediation triggered for {resource_id}: {remediation_strategy} - {'Success' if success else 'Failed'}")
        
    except Exception as e:
        logger.error(f"Error in remediation for {resource_id}: {e}")

def get_remediation_strategy(resource_type):
    """Get remediation strategy based on resource type"""
    strategies = {
        'ec2': 'restart_instance',
        'rds': 'scale_up',
        'eks': 'restart_deployment'
    }
    return strategies.get(resource_type, 'unknown')

# API Resources
class ResourceList(Resource):
    def get(self):
        """Get all resources"""
        return {
            'resources': list(resources.values()),
            'total': len(resources)
        }
    
    def post(self):
        """Add new resource"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'type', 'region']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            # Generate unique ID
            resource_id = f"{data['type']}-{data['name'].lower().replace(' ', '-')}-{int(time.time())}"
            
            # Create resource
            resource = {
                'id': resource_id,
                'name': data['name'],
                'type': data['type'],
                'region': data['region'],
                'status': 'healthy',
                'last_check': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat(),
                'config': data.get('config', {})
            }
            
            resources[resource_id] = resource
            health_status[resource_id] = {
                'status': 'healthy',
                'last_check': datetime.now().isoformat(),
                'failure_count': 0
            }
            
            logger.info(f"Added new resource: {resource_id}")
            return resource, 201
            
        except Exception as e:
            logger.error(f"Error adding resource: {e}")
            return {'error': 'Internal server error'}, 500

class ResourceDetail(Resource):
    def get(self, resource_id):
        """Get specific resource"""
        resource = resources.get(resource_id)
        if not resource:
            return {'error': 'Resource not found'}, 404
        
        return resource
    
    def put(self, resource_id):
        """Update resource"""
        try:
            resource = resources.get(resource_id)
            if not resource:
                return {'error': 'Resource not found'}, 404
            
            data = request.get_json()
            
            # Update allowed fields
            allowed_fields = ['name', 'config']
            for field in allowed_fields:
                if field in data:
                    resource[field] = data[field]
            
            resource['updated_at'] = datetime.now().isoformat()
            logger.info(f"Updated resource: {resource_id}")
            
            return resource
            
        except Exception as e:
            logger.error(f"Error updating resource: {e}")
            return {'error': 'Internal server error'}, 500
    
    def delete(self, resource_id):
        """Delete resource"""
        if resource_id not in resources:
            return {'error': 'Resource not found'}, 404
        
        del resources[resource_id]
        if resource_id in health_status:
            del health_status[resource_id]
        
        logger.info(f"Deleted resource: {resource_id}")
        return {'message': 'Resource deleted successfully'}

class Remediation(Resource):
    def post(self, resource_id):
        """Trigger manual remediation"""
        if resource_id not in resources:
            return {'error': 'Resource not found'}, 404
        
        trigger_remediation(resource_id)
        return {'message': 'Remediation triggered successfully'}

class HealthStatus(Resource):
    def get(self):
        """Get system health status"""
        return {
            'system_status': 'healthy',
            'total_resources': len(resources),
            'healthy_resources': len([r for r in resources.values() if r['status'] == 'healthy']),
            'unhealthy_resources': len([r for r in resources.values() if r['status'] == 'unhealthy']),
            'last_check': datetime.now().isoformat()
        }

class RemediationHistory(Resource):
    def get(self):
        """Get remediation history"""
        return {
            'remediations': remediation_history[-50:],  # Last 50 remediations
            'total': len(remediation_history)
        }

# API Routes
api.add_resource(ResourceList, '/api/resources')
api.add_resource(ResourceDetail, '/api/resources/<string:resource_id>')
api.add_resource(Remediation, '/api/remediate/<string:resource_id>')
api.add_resource(HealthStatus, '/api/health')
api.add_resource(RemediationHistory, '/api/remediations')

@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'YodaOps API',
        'version': '1.0.0',
        'endpoints': {
            'resources': '/api/resources',
            'health': '/api/health',
            'remediations': '/api/remediations'
        }
    })

@app.route('/docs')
def docs():
    """API Documentation"""
    return jsonify({
        'title': 'YodaOps API Documentation',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/resources': 'List all resources',
            'POST /api/resources': 'Add new resource',
            'GET /api/resources/{id}': 'Get specific resource',
            'PUT /api/resources/{id}': 'Update resource',
            'DELETE /api/resources/{id}': 'Delete resource',
            'POST /api/remediate/{id}': 'Trigger manual remediation',
            'GET /api/health': 'Get system health status',
            'GET /api/remediations': 'Get remediation history'
        }
    })

if __name__ == '__main__':
    # Load initial resources
    load_resources_from_yaml()
    
    # Start health check simulation in background
    health_thread = threading.Thread(target=simulate_health_check, daemon=True)
    health_thread.start()
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True) 