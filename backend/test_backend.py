#!/usr/bin/env python3
"""
Quick script to test if backend is running and check for errors
"""
import requests
import sys

BACKEND_URL = "http://localhost:3001"

def test_backend():
    print("=" * 60)
    print("Testing Backend Server")
    print("=" * 60)
    print()
    
    # Test 1: Check if server is running
    print("1. Testing if server is running...")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        if response.status_code == 200:
            print(f"   ✓ Server is running on {BACKEND_URL}")
            print(f"   Response: {response.json()}")
        else:
            print(f"   ⚠ Server responded with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print(f"   ✗ Cannot connect to {BACKEND_URL}")
        print("   → Backend server is NOT running!")
        print("   → Start it with: python RUN_ME.py")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    print()
    
    # Test 2: Check API endpoint
    print("2. Testing API endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/retrogames", timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ API endpoint is working")
        else:
            print(f"   ✗ API returned error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error details: {error_data}")
            except:
                print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ✗ Error testing API: {e}")
    
    print()
    print("=" * 60)
    print("Test Complete")
    print("=" * 60)
    return True

if __name__ == "__main__":
    test_backend()
