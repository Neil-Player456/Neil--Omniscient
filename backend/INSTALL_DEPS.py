#!/usr/bin/env python3
"""
Install all Python dependencies for the backend.
Run this once: python INSTALL_DEPS.py
"""
import subprocess
import sys
import os

print("=" * 60)
print("Installing Python dependencies...")
print("=" * 60)
print()

# Change to backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Install from requirements.txt
try:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print()
    print("=" * 60)
    print("✓ Dependencies installed successfully!")
    print("=" * 60)
    print()
    print("You can now run: python RUN_ME.py")
except subprocess.CalledProcessError as e:
    print()
    print("=" * 60)
    print("✗ Error installing dependencies")
    print("=" * 60)
    print(f"Error: {e}")
    input("\nPress Enter to exit...")
    sys.exit(1)

input("\nPress Enter to exit...")
