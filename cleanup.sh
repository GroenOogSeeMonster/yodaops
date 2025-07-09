#!/bin/bash

echo "🧹 YodaOps Cleanup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if directory exists and remove it
remove_dir() {
    if [ -d "$1" ]; then
        echo -e "${BLUE}🗑️  Removing $1${NC}"
        rm -rf "$1"
    else
        echo -e "${YELLOW}⚠️  Directory $1 not found${NC}"
    fi
}

# Function to check if file exists and remove it
remove_file() {
    if [ -f "$1" ]; then
        echo -e "${BLUE}🗑️  Removing $1${NC}"
        rm -f "$1"
    else
        echo -e "${YELLOW}⚠️  File $1 not found${NC}"
    fi
}

# Stop running services first
echo -e "${YELLOW}🛑 Stopping running services...${NC}"
cd deploy 2>/dev/null && docker-compose down --volumes --remove-orphans 2>/dev/null && cd ..

# Kill any running processes
echo -e "${YELLOW}🔄 Killing any running YodaOps processes...${NC}"
pkill -f "python app.py" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
pkill -f "next dev" 2>/dev/null

# Backend cleanup
echo ""
echo -e "${GREEN}📦 Backend Cleanup${NC}"
echo "-------------------"

cd backend 2>/dev/null

# Remove Python artifacts
remove_dir "venv"
remove_dir "__pycache__"
remove_dir ".pytest_cache"
remove_file "*.pyc"
remove_file "*.pyo"
remove_file "*.pyd"
remove_file ".coverage"
remove_file "htmlcov"
remove_dir "dist"
remove_dir "build"
remove_dir "*.egg-info"

# Remove logs
remove_file "*.log"
remove_file "app.log"

# Remove database files (if any)
remove_file "*.db"
remove_file "*.sqlite"
remove_file "*.sqlite3"

cd ..

# Frontend cleanup
echo ""
echo -e "${GREEN}🌐 Frontend Cleanup${NC}"
echo "---------------------"

cd frontend 2>/dev/null

# Remove Node.js artifacts
remove_dir "node_modules"
remove_dir ".next"
remove_dir "out"
remove_dir "dist"
remove_dir "build"

# Remove cache directories
remove_dir ".cache"
remove_dir ".parcel-cache"
remove_dir ".eslintcache"

# Remove lock files (optional - uncomment if you want to remove them)
# remove_file "package-lock.json"
# remove_file "yarn.lock"

# Remove environment files
remove_file ".env.local"
remove_file ".env.development.local"
remove_file ".env.test.local"
remove_file ".env.production.local"

# Remove IDE files
remove_dir ".vscode"
remove_dir ".idea"

cd ..

# Docker cleanup
echo ""
echo -e "${GREEN}🐳 Docker Cleanup${NC}"
echo "------------------"

# Remove Docker containers, images, and volumes
echo -e "${BLUE}🗑️  Removing Docker containers...${NC}"
docker-compose -f deploy/docker-compose.yml down --volumes --remove-orphans 2>/dev/null

echo -e "${BLUE}🗑️  Removing Docker images...${NC}"
docker rmi deploy-backend deploy-frontend 2>/dev/null

echo -e "${BLUE}🗑️  Removing unused Docker resources...${NC}"
docker system prune -f 2>/dev/null

# Infrastructure cleanup
echo ""
echo -e "${GREEN}🏗️  Infrastructure Cleanup${NC}"
echo "---------------------------"

cd infrastructure 2>/dev/null

# Remove Terraform artifacts
remove_dir ".terraform"
remove_file "*.tfstate"
remove_file "*.tfstate.backup"
remove_file "*.tfstate.*"
remove_dir ".terraform.lock.hcl"

# Remove Terraform plan files
remove_file "*.tfplan"
remove_file "*.tfvars"

cd ..

# Root level cleanup
echo ""
echo -e "${GREEN}📁 Root Level Cleanup${NC}"
echo "------------------------"

# Remove temporary files
remove_file "*.tmp"
remove_file "*.temp"
remove_file "*~"
remove_file ".#*"

# Remove OS-specific files
remove_file ".DS_Store"
remove_file "Thumbs.db"
remove_dir ".Trash"

# Remove log files
remove_file "*.log"
remove_file "logs"

# Remove backup files
remove_file "*.bak"
remove_file "*.backup"

# Remove any remaining cache
remove_dir ".cache"

echo ""
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary of what was removed:${NC}"
echo "   • Python virtual environments and cache"
echo "   • Node.js node_modules and build artifacts"
echo "   • Docker containers, images, and volumes"
echo "   • Terraform state files and cache"
echo "   • Temporary and cache files"
echo "   • IDE-specific files"
echo ""
echo -e "${BLUE}💡 To start fresh:${NC}"
echo "   • Run './start.sh' for Docker deployment"
echo "   • Run './start-manual.sh' for manual deployment"
echo ""
echo -e "${GREEN}🎉 YodaOps is now clean and ready for a fresh start!${NC}" 