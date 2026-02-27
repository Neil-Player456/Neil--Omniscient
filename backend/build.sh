#!/usr/bin/env bash
# Build script for Render deployment
# This script runs during the build phase on Render

set -e  # Exit immediately on errors

echo "=========================================="
echo "Backend Build Script"
echo "=========================================="

# Upgrade pip, setuptools, and wheel first
echo "Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Install project dependencies
echo "Installing project dependencies..."
pip install --no-cache-dir -r requirements.txt

# Ensure Gunicorn is installed (required for production)
echo "Ensuring Gunicorn is installed..."
pip install --upgrade gunicorn

# Run database migrations if needed
echo "Running database migrations..."
python -m flask db upgrade || echo "Note: Migrations skipped or database not configured"

echo "=========================================="
echo "Build complete!"
echo "=========================================="
