"""Quick script to check if backend is running"""
import socket
import sys

def check_port(host, port):
    """Check if a port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

print("Checking if backend is running...")
print("=" * 50)

ports_to_check = [3001, 5000, 8000, 3000]
backend_running = False

for port in ports_to_check:
    if check_port('127.0.0.1', port):
        print(f"✓ Port {port} is OPEN - Backend might be running here!")
        backend_running = True
        # Try to verify it's Flask
        try:
            import requests
            response = requests.get(f'http://127.0.0.1:{port}/api', timeout=2)
            if response.status_code == 200:
                print(f"  ✓ Confirmed: Flask API is responding on port {port}")
        except:
            pass
    else:
        print(f"✗ Port {port} is CLOSED")

print("=" * 50)
if not backend_running:
    print("\nBackend is NOT running on any common port.")
    print("\nTo start the backend:")
    print("  1. Open a terminal in the 'backend' folder")
    print("  2. Run: python RUN_ME.py")
    print("  3. Or run: pipenv run start")
else:
    print("\nBackend appears to be running!")
    print("If frontend still can't connect, check:")
    print("  - Is VITE_BACKEND_URL set correctly in frontend/.env?")
    print("  - Is the backend URL in Actions.js correct?")
