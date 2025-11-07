@echo off
echo ========================================
echo   WANDRLY BACKEND API - Starting...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and add your API keys!
    echo File location: backend\.env
    echo.
    pause
)

echo Starting backend server...
echo.
echo Backend API will run on: http://localhost:3000
echo Health check: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm start

