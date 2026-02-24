"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
import sys
src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from flask import Flask, request, jsonify, url_for
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from flask_cors import CORS


ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})


db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'test.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
migrations_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'migrations')
if not os.path.exists(migrations_dir):
    migrations_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'migrations')
MIGRATE = Migrate(app, db, compare_type=True, directory=migrations_dir if os.path.exists(migrations_dir) else None)
db.init_app(app)

with app.app_context():
    try:
        db.create_all()
        print("✓ Database tables initialized")
    except Exception as e:
        print(f"⚠ Database initialization warning: {e}")

setup_admin(app)


setup_commands(app)


app.register_blueprint(api, url_prefix='/api')

jwt_secret = os.environ.get("JWT_SECRET")
if jwt_secret is None:
    jwt_secret = "your-secret-string-change-in-production"
    print("WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env for production!")
app.config["JWT_SECRET_KEY"] = jwt_secret
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 7 * 24 * 60 * 60 * 52
jwt = JWTManager(app)


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.errorhandler(500)
def handle_500_error(e):
    import traceback
    error_details = traceback.format_exc()
    print("\n" + "="*60)
    print("500 INTERNAL SERVER ERROR")
    print("="*60)
    print(error_details)
    print("="*60 + "\n")
    return jsonify({"error": "Internal server error", "message": str(e)}), 500

@app.errorhandler(404)
def handle_404_error(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    error_details = traceback.format_exc()
    print("\n" + "="*60)
    print("UNHANDLED EXCEPTION")
    print("="*60)
    print(error_details)
    print("="*60 + "\n")
    if ENV == "development":
        return jsonify({
            "error": "An error occurred", 
            "message": str(e),
            "traceback": error_details
        }), 500
    return jsonify({"error": "An error occurred", "message": str(e)}), 500


@app.before_request
def log_request_info():
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info(f"Request: {request.method} {request.path}")
    if request.is_json:
        try:
            logger.info(f"Body: {request.get_json()}")
        except Exception:
            pass

@app.after_request
def log_response_info(response):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Response: {response.status_code} for {request.method} {request.path}")
    if response.status_code >= 400:
        logger.error(f"Error Response: {response.get_data(as_text=True)[:200]}")
    return response


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return jsonify({"message": "API Server is running"})


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
