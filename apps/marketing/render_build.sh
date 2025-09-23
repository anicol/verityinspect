#!/bin/bash
set -e

echo "Installing Node.js dependencies..."
npm install

echo "Building marketing site..."
npm run build

echo "Marketing site build completed successfully!"