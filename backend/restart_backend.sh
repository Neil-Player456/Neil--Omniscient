#!/bin/bash
# Simple script to restart the backend server

echo "Stopping any running Flask processes..."
pkill -f "python.*RUN_ME.py" || pkill -f "flask run" || echo "No Flask processes found"

echo "Waiting 2 seconds..."
sleep 2

echo "Starting backend server..."
cd "$(dirname "$0")"
python RUN_ME.py
