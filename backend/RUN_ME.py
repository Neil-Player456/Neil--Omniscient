#!/usr/bin/env python3
"""
Double-click this file or run: python RUN_ME.py
This will start your Flask backend server.
"""
import os
import sys
import subprocess

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

try:
    import flask
except ImportError:
    print("=" * 60)
    print("Flask is not installed. Installing dependencies...")
    print("=" * 60)
    print()
    try:
        print("Upgrading pip and wheel...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip", "wheel"], 
                                stderr=subprocess.DEVNULL)
        except:
            pass 
        
        print()
        print("Installing dependencies (clearing cache to avoid version conflicts)...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--no-cache-dir", "-r", "requirements.txt"])
        print()
        print("✓ Dependencies installed successfully!")
        print()
    except subprocess.CalledProcessError as e:
        print()
        print("✗ Failed to install dependencies automatically.")
        print("Please run manually:")
        print("  pip install --upgrade pip setuptools wheel")
        print("  pip install -r requirements.txt")
        print()
        input("Press Enter to exit...")
        sys.exit(1)

try:
    print("Attempting to import Flask app...")
    from api.app import app
    print("✓ Successfully imported Flask app")
except ImportError as e:
    print(f"✗ Error importing app: {e}")
    print(f"  Current directory: {os.getcwd()}")
    print(f"  Looking for app in: {SCRIPT_DIR}/api/app.py")
    print()
    import traceback
    print("Full error traceback:")
    traceback.print_exc()
    print()
    print("Trying to install missing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--no-cache-dir", "-r", "requirements.txt"])
        print("✓ Dependencies installed. Please run this script again.")
    except:
        print("✗ Could not install dependencies automatically.")
        print("Please run manually: pip install -r requirements.txt")
    input("\nPress Enter to exit...")
    sys.exit(1)
except Exception as e:
    print(f"✗ Unexpected error importing app: {e}")
    import traceback
    print("\nFull error traceback:")
    traceback.print_exc()
    input("\nPress Enter to exit...")
    sys.exit(1)

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    print(f"\n{'='*50}")
    print(f"Starting Flask server on http://localhost:{PORT}")
    print(f"{'='*50}")
    print("Press Ctrl+C to stop\n")
    
    try:
        app.run(host='0.0.0.0', port=PORT, debug=True)
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except OSError as e:
        if "Address already in use" in str(e) or "address is already in use" in str(e).lower():
            print(f"\n\n✗ ERROR: Port {PORT} is already in use!")
            print(f"   Another process is using port {PORT}.")
            print(f"   Either stop that process or change the PORT environment variable.")
        else:
            print(f"\n\n✗ OS Error: {e}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")
    except Exception as e:
        print(f"\n\n✗ Error starting server: {e}")
        import traceback
        print("\nFull error traceback:")
        traceback.print_exc()
        input("\nPress Enter to exit...")
