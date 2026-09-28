@echo off
echo ========================================================
echo   Starting MediCare - Hospital Management System
echo ========================================================

:: 1. Check Backend .env
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo [INFO] Creating backend\.env from .env.example...
        copy "backend\.env.example" "backend\.env" >nul
    ) else (
        echo [WARNING] backend\.env not found! Database connection may fail.
    )
)

:: 2. Check Frontend .env
if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        echo [INFO] Creating frontend\.env from .env.example...
        copy "frontend\.env.example" "frontend\.env" >nul
    )
)

:: 3. Check Frontend node_modules
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

:: 4. Start Backend in separate window
echo [INFO] Launching Backend on port 8080...
start "MediCare Backend (Port 8080)" cmd /k "cd /d %~dp0backend && if exist mvnw.cmd (mvnw.cmd spring-boot:run) else (mvn spring-boot:run)"

:: 5. Start Frontend in separate window
echo [INFO] Launching Frontend on port 5173...
start "MediCare Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Services are starting up!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8080
echo ========================================================
timeout /t 5 >nul
start http://localhost:5173
