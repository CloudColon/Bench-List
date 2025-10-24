#!/bin/bash

# BenchList - Start All Servers Script
# This script starts PostgreSQL, Django backend, and Next.js frontend

echo "=========================================="
echo "  Starting BenchList Application"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    netstat -ano | grep ":$1" | grep "LISTENING" > /dev/null 2>&1
    return $?
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"

    # Kill background jobs
    jobs -p | xargs -r kill 2>/dev/null

    echo -e "${GREEN}All servers stopped.${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# 1. Start PostgreSQL Server
echo -e "${BLUE}[1/3] Starting PostgreSQL Server...${NC}"
if check_port 5432; then
    echo -e "${YELLOW}PostgreSQL is already running on port 5432${NC}"
else
    "C:/Program Files/PostgreSQL/17/bin/pg_ctl" -D "C:/PostgresData" start
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PostgreSQL started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start PostgreSQL${NC}"
        exit 1
    fi
fi
echo ""

# Wait a moment for PostgreSQL to fully start
sleep 2

# 2. Start Django Backend Server
echo -e "${BLUE}[2/3] Starting Django Backend Server...${NC}"
cd backend
if check_port 8000; then
    echo -e "${YELLOW}Backend server is already running on port 8000${NC}"
else
    # Activate virtual environment and run Django
    (
        # Use uv to run Django manage.py
        uv run manage.py runserver 2>&1 | while IFS= read -r line; do
            echo -e "${GREEN}[Backend]${NC} $line"
        done
    ) &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Django backend starting... (PID: $BACKEND_PID)${NC}"
fi
cd ..
echo ""

# Wait a moment for Django to start
sleep 3

# 3. Start Next.js Frontend Server
echo -e "${BLUE}[3/3] Starting Next.js Frontend Server...${NC}"
cd frontend
if check_port 3000; then
    echo -e "${YELLOW}Frontend server might be running on port 3000${NC}"
fi

(
    npm run dev 2>&1 | while IFS= read -r line; do
        echo -e "${BLUE}[Frontend]${NC} $line"
    done
) &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Next.js frontend starting... (PID: $FRONTEND_PID)${NC}"
cd ..
echo ""

echo "=========================================="
echo -e "${GREEN}  All Servers Started Successfully!${NC}"
echo "=========================================="
echo ""
echo "Services:"
echo -e "  • PostgreSQL:  ${GREEN}localhost:5432${NC}"
echo -e "  • Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "  • Frontend:    ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for all background jobs
wait
