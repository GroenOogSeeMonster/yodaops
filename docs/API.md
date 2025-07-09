# YodaOps API Documentation

## Overview

The YodaOps API provides endpoints for managing AWS resources, monitoring health status, and triggering remediation actions.

**Base URL**: `http://localhost:5000`

## Authentication

Currently, the API runs without authentication for development purposes. In production, implement proper authentication using JWT tokens or AWS IAM roles.

## Endpoints

### Resources

#### GET /api/resources

Retrieve all registered resources.

**Response**:
```json
{
  "resources": [
    {
      "id": "ec2-web-server-001",
      "name": "Web Server Production",
      "type": "ec2",
      "region": "us-east-1",
      "status": "healthy",
      "last_check": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T09:00:00Z",
      "config": {
        "instance_type": "t3.medium",
        "instance_id": "i-1234567890abcdef0"
      }
    }
  ],
  "total": 1
}
```

#### POST /api/resources

Add a new resource.

**Request Body**:
```json
{
  "name": "New EC2 Instance",
  "type": "ec2",
  "region": "us-east-1",
  "config": {
    "instance_type": "t3.micro"
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "ec2-new-ec2-instance-1705312800",
  "name": "New EC2 Instance",
  "type": "ec2",
  "region": "us-east-1",
  "status": "healthy",
  "last_check": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "config": {
    "instance_type": "t3.micro"
  }
}
```

#### GET /api/resources/{id}

Retrieve a specific resource.

**Response**:
```json
{
  "id": "ec2-web-server-001",
  "name": "Web Server Production",
  "type": "ec2",
  "region": "us-east-1",
  "status": "healthy",
  "last_check": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T09:00:00Z",
  "config": {
    "instance_type": "t3.medium",
    "instance_id": "i-1234567890abcdef0"
  }
}
```

#### PUT /api/resources/{id}

Update a resource.

**Request Body**:
```json
{
  "name": "Updated Web Server",
  "config": {
    "instance_type": "t3.large"
  }
}
```

#### DELETE /api/resources/{id}

Delete a resource.

**Response**: `200 OK`
```json
{
  "message": "Resource deleted successfully"
}
```

### Health Monitoring

#### GET /api/health

Get system health status.

**Response**:
```json
{
  "system_status": "healthy",
  "total_resources": 5,
  "healthy_resources": 4,
  "unhealthy_resources": 1,
  "last_check": "2024-01-15T10:30:00Z"
}
```

### Remediation

#### POST /api/remediate/{id}

Trigger manual remediation for a resource.

**Response**: `200 OK`
```json
{
  "message": "Remediation triggered successfully"
}
```

#### GET /api/remediations

Get remediation history.

**Response**:
```json
{
  "remediations": [
    {
      "resource_id": "ec2-web-server-001",
      "strategy": "restart_instance",
      "triggered_at": "2024-01-15T10:25:00Z",
      "success": true,
      "status": "completed"
    }
  ],
  "total": 1
}
```

## Resource Types

### EC2
- **Type**: `ec2`
- **Remediation Strategy**: `restart_instance`
- **Configuration**: Instance type, instance ID, VPC, subnet, security groups

### RDS
- **Type**: `rds`
- **Remediation Strategy**: `scale_up`
- **Configuration**: Instance class, engine, storage, backup retention

### EKS
- **Type**: `eks`
- **Remediation Strategy**: `restart_deployment`
- **Configuration**: Cluster name, Kubernetes version, node groups

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required field: name"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Health Check Simulation

The system simulates health checks every 30 seconds with a 10% failure rate. When a resource fails health checks twice consecutively, automatic remediation is triggered.

## Remediation Strategies

1. **EC2**: Restart the instance (stop/start)
2. **RDS**: Scale up the instance class
3. **EKS**: Restart the deployment

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

CORS is enabled for development. Configure appropriate origins for production deployment. 