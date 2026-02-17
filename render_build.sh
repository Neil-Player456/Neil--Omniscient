#!/usr/bin/env bash
# exit on error
set -o errexit

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies and run migrations
cd backend
pipenv install || pip install -r requirements.txt

pipenv run upgrade || python -m flask db upgrade
cd ..
