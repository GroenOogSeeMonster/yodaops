# YodaOps - AI-Driven DevOps Platform

A production-ready, internal AI-driven DevOps platform to monitor, detect, and automatically remediate infrastructure issues across AWS (EC2, RDS, EKS).

## 🏗️ Architecture

```
YodaOps/
├── infrastructure/          # Terraform modules (EC2, RDS, EKS, IAM)
├── backend/                 # Flask app with APIs and monitoring logic
├── frontend/                # Next.js app with resources UI, modals
├── deploy/                  # Docker compose setup
└── docs/                    # Documentation and guides
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- Terraform (for infrastructure deployment)

### Local Development

1. **Clone and setup:**
```bash
git clone <repository>
cd yodaops
```

2. **Start the full stack:**
```bash
docker-compose up --build
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/docs

### Manual Development Setup

1. **Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Features

### Core Functionality
- **Resource Management**: Register and monitor AWS resources (EC2, RDS, EKS)
- **Health Monitoring**: Background health checks with configurable failure simulation
- **AI Remediation**: Automatic issue resolution using predefined strategies
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

### API Endpoints
- `GET /api/resources` - List all registered resources
- `POST /api/resources` - Add new resource
- `GET /api/resources/{id}` - Get specific resource details
- `PUT /api/resources/{id}` - Update resource configuration
- `DELETE /api/resources/{id}` - Remove resource
- `GET /api/health` - System health status
- `POST /api/remediate/{id}` - Trigger manual remediation

### Remediation Strategies
- **EC2**: Instance restart, stop/start cycles
- **RDS**: Scaling operations, parameter group updates
- **EKS**: Pod restart, deployment scaling

## 🏛️ Infrastructure

### Terraform Modules
- **EC2 Module**: Instance management and monitoring
- **RDS Module**: Database monitoring and scaling
- **EKS Module**: Kubernetes cluster monitoring
- **IAM Module**: Security roles and policies

### Deployment
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

## 🔐 Security

- No hardcoded secrets in code
- Input sanitization on all API endpoints
- Environment-based configuration
- IAM role-based AWS access (production)
- CORS protection for frontend-backend communication

## 📊 Monitoring & Alerts

- Real-time health status dashboard
- Background health check simulation (10% failure rate)
- Automatic remediation triggers
- Event-driven architecture ready for AWS EventBridge integration

## 🚀 Production Deployment

### Docker Deployment
```bash
docker-compose -f deploy/docker-compose.prod.yml up -d
```

### Environment Variables
```bash
# Backend
FLASK_ENV=production
AWS_REGION=us-east-1
DATABASE_URL=your-db-url

# Frontend
NEXT_PUBLIC_API_URL=https://api.yodaops.com
```

## 🔮 Future Enhancements (Phase 2)

- **AI-Powered Remediation**: LangChain/Bedrock integration for intelligent decisions
- **Real-time Alerts**: Slack/Mattermost integration
- **Advanced Monitoring**: CloudWatch metrics integration
- **State Management**: DynamoDB for persistent storage
- **Terraform Integration**: State introspection and drift detection

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation at `/docs`

---

**Built with ❤️ for modern DevOps teams**