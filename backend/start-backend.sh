#!/bin/bash

echo "========================================"
echo "  WANDRLY BACKEND API - Starting..."
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file and add your API keys!"
    echo "File location: backend/.env"
    echo ""
    read -p "Press enter to continue..."
fi

echo "Starting backend server..."
echo ""
echo "Backend API will run on: http://localhost:3000"
echo "Health check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

npm start

