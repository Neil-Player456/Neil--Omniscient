"""
Vercel serverless function entry point for Flask API
"""
import sys
import os

# Add parent directory to path so we can import api module
backend_dir = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, backend_dir)

from api.app import app

