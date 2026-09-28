#!/bin/bash

echo "========================================================"
echo "  Starting MediCare - Hospital Management System"
echo "========================================================"

# Directory where script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Check Backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        echo "[INFO] Creating backend/.env from .env.example..."
        cp backend/.env.example backend/.env
    fi
fi

# 2. Check Frontend .env
if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/.env.example" ]; then
        echo "[INFO] Creating frontend/.env from .env.example..."
        cp frontend/.env.example frontend/.env
    fi
fi

# 3. Check Frontend node_modules
if [ ! -d "frontend/node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    (cd frontend && npm install)
fi

# 4. Make mvnw executable if present
if [ -f "backend/mvnw" ]; then
    chmod +x backend/mvnw
fi

# 5. Start Backend
echo "[INFO] Starting Backend on port 8080..."
(cd backend && ./mvnw spring-boot:run) &
BACKEND_PID=$!

# 6. Start Frontend
echo "[INFO] Starting Frontend on port 5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo "  Services started!"
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8080"
echo "========================================================"
echo "Press Ctrl+C to stop both services."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
