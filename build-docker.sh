#!/bin/bash

# Build script for Docker Compose
echo "Building Primetrade Docker containers..."

# Check if .env file exists
if [ ! -f "./backend/.env" ]; then
    echo "⚠️  Warning: backend/.env file not found!"
    echo "Creating backend/.env from example..."
    if [ -f "./backend/.env.example" ]; then
        cp ./backend/.env.example ./backend/.env
        echo "✅ Created backend/.env - Please edit it with your configuration"
    else
        echo "❌ backend/.env.example not found. Please create backend/.env manually"
        exit 1
    fi
fi

# Build and start services
echo "🚀 Building and starting Docker containers..."
docker-compose up --build -d

echo ""
echo "✅ Build complete!"
echo ""
echo "Services are running at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5001/api"
echo "  - MongoDB: localhost:27017"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

