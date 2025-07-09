#!/bin/bash

echo "🚀 Starting YodaOps - Manual Mode"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Backend Setup
echo "📦 Setting up Backend..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start backend in background
echo "Starting backend server..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Frontend Setup
echo "🌐 Setting up Frontend..."

cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Start frontend in background
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

# Success message
echo ""
echo -e "${GREEN}🎉 YodaOps is now running!${NC}"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Documentation: http://localhost:5000/docs"
echo ""
echo "📊 Process IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping YodaOps...${NC}"
    
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Stopping backend..."
        kill $BACKEND_PID
    fi
    
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping frontend..."
        kill $FRONTEND_PID
    fi
    
    echo -e "${GREEN}✅ YodaOps stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Wait for processes
wait 