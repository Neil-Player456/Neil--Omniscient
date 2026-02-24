import sys
sys.path.insert(0, '.')
try:
    from api.routes import api
    print("✓ Successfully imported Blueprint 'api'")
    print(f"  Blueprint name: {api.name}")
    print(f"  Blueprint URL prefix: {api.url_prefix}")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
