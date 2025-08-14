#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Navigate to frontend directory and build
echo "Building frontend..."
cd frontend/quote-bill-app
npm install
npm run build

echo "Build completed successfully!"
