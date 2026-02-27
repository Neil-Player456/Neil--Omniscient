#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip, setuptools, and wheel first
pip install --upgrade pip setuptools wheel

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies and run migrations
cd backend
pip install --no-cache-dir -r requirements.txt

# Run database migrations
python -m flask db upgrade || echo "Migration skipped or failed"
cd ..
