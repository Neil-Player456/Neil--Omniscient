"""
Diagnostic script to check why the backend isn't starting
"""
import os
import sys
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(SCRIPT_DIR)

print("=" * 60)
print("BACKEND DIAGNOSTIC CHECK")
print("=" * 60)
print()

print("1. Checking Python version...")
print(f"   Python: {sys.version}")
print()

print("2. Checking working directory...")
print(f"   Current directory: {os.getcwd()}")
print(f"   Expected: {SCRIPT_DIR}")
print()

print("3. Checking required files...")
files_to_check = [
    'api/app.py',
    'api/__init__.py',
    'api/models.py',
    'api/routes.py',
    'requirements.txt'
]
for file in files_to_check:
    exists = os.path.exists(file)
    status = "✓" if exists else "✗"
    print(f"   {status} {file}")
print()

print("4. Checking Flask installation...")
try:
    import flask
    print(f"   ✓ Flask version: {flask.__version__}")
except ImportError as e:
    print(f"   ✗ Flask not installed: {e}")
    print("   Run: pip install -r requirements.txt")
    sys.exit(1)
print()

print("5. Checking critical dependencies...")
deps = [
    ('flask', 'Flask'),
    ('flask_sqlalchemy', 'Flask-SQLAlchemy'),
    ('flask_migrate', 'Flask-Migrate'),
    ('flask_jwt_extended', 'Flask-JWT-Extended'),
    ('flask_cors', 'Flask-CORS'),
]
missing = []
for module, name in deps:
    try:
        __import__(module)
        print(f"   ✓ {name}")
    except ImportError:
        print(f"   ✗ {name} - MISSING")
        missing.append(name)

if missing:
    print()
    print("   Missing dependencies detected!")
    print("   Run: pip install -r requirements.txt")
    sys.exit(1)
print()

print("6. Attempting to import Flask app...")
# Add backend directory to path so we can import api module
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

try:
    from api.app import app
    print("   ✓ Successfully imported Flask app")
    print(f"   ✓ App name: {app.name}")
    print(f"   ✓ Debug mode: {app.debug}")
except ImportError as e:
    print(f"   ✗ Failed to import app: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"   ✗ Error importing app: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
print()

print("7. Checking database configuration...")
db_url = os.getenv("DATABASE_URL")
if db_url:
    print(f"   Using DATABASE_URL: {db_url[:50]}...")
else:
    db_path = os.path.join(SCRIPT_DIR, 'instance', 'test.db')
    print(f"   Using SQLite: {db_path}")
    print(f"   Database file exists: {os.path.exists(db_path)}")
print()

print("8. Checking JWT configuration...")
jwt_secret = os.getenv("JWT_SECRET")
if jwt_secret:
    print("   ✓ JWT_SECRET is set")
else:
    print("   ⚠ JWT_SECRET not set (will use None)")
print()

print("=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
print()
print("If all checks passed, try starting the server:")
print("  python RUN_ME.py")
print()
