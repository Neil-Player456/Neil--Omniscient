"""
Vercel serverless function entry point for Flask API
"""
import sys
import os

# Add src directory to Python path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Import the Flask app
from app import app

# Vercel expects the app to be exported directly
# The @vercel/python runtime will handle WSGI conversion automatically
