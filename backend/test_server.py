#!/usr/bin/env python3
"""
Quick test to check if the Flask server is running
"""
import urllib.request
import urllib.error
import sys

try:
    response = urllib.request.urlopen('http://localhost:3001', timeout=2)
    print("=" * 60)
    print("✓ Backend server is RUNNING!")
    print("=" * 60)
    print(f"Status Code: {response.getcode()}")
    print(f"URL: http://localhost:3001")
    print("=" * 60)
    sys.exit(0)
except urllib.error.URLError as e:
    print("=" * 60)
    print("✗ Backend server is NOT running")
    print("=" * 60)
    print(f"Error: {e}")
    print("\nMake sure you've started the server with:")
    print("  python RUN_ME.py")
    print("=" * 60)
    sys.exit(1)
except Exception as e:
    print(f"Error checking server: {e}")
    sys.exit(1)
