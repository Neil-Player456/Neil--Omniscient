"""
Simple script to run the Flask backend
Run this from anywhere: python backend/run.py
Or from backend directory: python run.py
"""
import os
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(SCRIPT_DIR)

if not os.path.exists('.env'):
    os.environ.setdefault('FLASK_APP', 'api/app.py')
    os.environ.setdefault('FLASK_DEBUG', '1')
    print("Note: Create a .env file in backend/ for production use")

# Add backend directory to path so we can import api module
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

print(f"Working directory: {os.getcwd()}")
print(f"Python path includes: {SCRIPT_DIR}")

# Import and run the app
try:
    from api.app import app
    print("✓ Successfully imported Flask app")
except ImportError as e:
    print(f"✗ Error importing app: {e}")
    print(f"  Current directory: {os.getcwd()}")
    print(f"  Looking for app in: {SCRIPT_DIR}/api/app.py")
    sys.exit(1)

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    print(f"\n{'='*50}")
    print(f"Starting Flask server on http://localhost:{PORT}")
    print(f"{'='*50}")
    print("Press Ctrl+C to stop\n")
    app.run(host='0.0.0.0', port=PORT, debug=True)
