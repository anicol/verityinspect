#!/bin/bash
set -e

echo "Installing Node.js dependencies..."
npm install

echo "Building React application..."
npm run build

echo "Web app build completed successfully!"