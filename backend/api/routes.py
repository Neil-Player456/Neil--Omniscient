"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_jwt_extended import get_jwt_identity, create_access_token, jwt_required
import hashlib
import requests




api = Blueprint('api', __name__)

CLIENT_ID = "2r3wcled8ugszufen3r4r2makgitqq"
CLIENT_SECRET = "j518b3kme8d7lmw8yr6mfwa26n6wxq"
RAWG_API_KEY = "e09cf7c5817241ee825687b3373f921f"  


def get_igdb_token():
    url = "https://id.twitch.tv/oauth2/token"
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    try:
        r = requests.post(url, data=payload)
        r.raise_for_status()
        token = r.json()["access_token"]
        print("✅ IGDB token refreshed")
        return token
    except Exception as e:
        print("❌ Failed to get IGDB token:", e)
        return None


ACCESS_TOKEN = get_igdb_token()

@api.route('/retrogames', methods=['GET', 'POST'])
def get_vintage_games():
    global ACCESS_TOKEN
    if request.method == 'POST':
        payload = request.get_json() or {}
    else:
        payload = request.args or {}

    try:
        limit = int(payload.get('limit', 20))
        offset = int(payload.get('offset', 0))
    except ValueError:
        return jsonify({"error": "limit and offset must be integers"}), 400

    
    if not ACCESS_TOKEN:
        ACCESS_TOKEN = get_igdb_token()
        if not ACCESS_TOKEN:
            return jsonify({"error": "Failed to get IGDB token"}), 500

    headers = {
        "Client-ID": CLIENT_ID,
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    igdb_query = f"""
        fields 
            name,
            summary,
            cover.url,
            genres.name,
            first_release_date,
            platforms.name,
            involved_companies.company.name,
            involved_companies.developer,
            rating,
            screenshots.url;
        sort first_release_date desc;
        limit {limit};
        offset {offset};
    """

    response = requests.post(
        "https://api.igdb.com/v4/games",
        headers=headers,
        data=igdb_query
    )

    # auto-refresh token if 401
    if response.status_code == 401:
        print("⚠️ IGDB token expired, refreshing...")
        ACCESS_TOKEN = get_igdb_token()
        headers["Authorization"] = f"Bearer {ACCESS_TOKEN}"
        response = requests.post(
            "https://api.igdb.com/v4/games",
            headers=headers,
            data=igdb_query
        )

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch games from IGDB", "details": response.text}), response.status_code

    games = response.json()

    youtube_links = {
        "Super Mario Bros.": "https://www.youtube.com/embed/KM8Y4wqXFz4",
        "Sonic the Hedgehog": "https://www.youtube.com/embed/CwYNFlsLTs0",
        "The Legend of Zelda": "https://www.youtube.com/embed/cI2uKsbFj94",
        "Pac-Man": "https://www.youtube.com/embed/teQwViKMnxk",
        "Donkey Kong": "https://www.youtube.com/embed/1P-xP8FJj28"
    }

    for game in games:
        name = game.get("name")
        game["gameplay_url"] = youtube_links.get(name)

    return jsonify(games), 200


@api.route('/signup', methods=['POST'])
def signup():
    try:
        body = request.get_json()
        
        if not body or not body.get('email') or not body.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        # Check if user already exists
        try:
            existing_user = User.query.filter_by(email=body['email']).first()
            if existing_user:
                return jsonify({"error": "User already exists"}), 400
        except Exception as db_error:
            # Database might not be initialized
            return jsonify({"error": f"Database error: {str(db_error)}. Please run database migrations."}), 500
        
        # Hash password
        password_hash = hashlib.sha256(body['password'].encode()).hexdigest()
        
        # Create new user
        new_user = User(
            email=body['email'],
            password=password_hash,
            is_active=True
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User created successfully"}), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_details = traceback.format_exc()
        print(f"Signup error: {error_details}")
        return jsonify({"error": str(e), "details": error_details}), 500


@api.route('/login', methods=['POST'])
def login():
    try:
        body = request.get_json()
        
        if not body or not body.get('email') or not body.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        # Hash password to compare
        password_hash = hashlib.sha256(body['password'].encode()).hexdigest()
        
        # Find user
        try:
            user = User.query.filter_by(email=body['email'], password=password_hash).first()
        except Exception as db_error:
            return jsonify({"error": f"Database error: {str(db_error)}. Please run database migrations."}), 500
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        if not user.is_active:
            return jsonify({"error": "User account is inactive"}), 403
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "access_token": access_token,
            "user": user.serialize()
        }), 200
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Login error: {error_details}")
        return jsonify({"error": str(e)}), 500


@api.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "user": user.serialize(),
            "access_token": access_token
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if request.method == 'GET':
            return jsonify({"user": user.serialize()}), 200
        
        elif request.method == 'PUT':
            body = request.get_json() or {}
            
            if 'about' in body:
                user.about = body['about']
            
            db.session.commit()
            
            return jsonify({"user": user.serialize()}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/saved-games', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def saved_games():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if request.method == 'GET':
            saved_games = user.saved_games or []
            return jsonify(saved_games), 200
        
        elif request.method == 'PUT':
            body = request.get_json() or {}
            game_data = body.get('game') or body
            
            if not game_data:
                return jsonify({"error": "Game data is required"}), 400
            
            # Initialize saved_games if None
            if user.saved_games is None:
                user.saved_games = []
            
            # Check if game already exists
            game_id = game_data.get('id') or game_data.get('uid')
            existing_game = next(
                (g for g in user.saved_games if g.get('id') == game_id or g.get('uid') == game_id),
                None
            )
            
            if existing_game:
                return jsonify({
                    "message": "Game already saved",
                    "saved_games": user.saved_games
                }), 200
            
            # Add game to saved_games
            user.saved_games.append(game_data)
            db.session.commit()
            
            return jsonify({
                "message": "Game saved successfully",
                "saved_games": user.saved_games
            }), 200
        
        elif request.method == 'DELETE':
            body = request.get_json() or {}
            game_id = body.get('game_id')
            
            if not game_id:
                return jsonify({"error": "game_id is required"}), 400
            
            # Initialize saved_games if None
            if user.saved_games is None:
                user.saved_games = []
            
            # Remove game from saved_games
            user.saved_games = [
                g for g in user.saved_games 
                if g.get('id') != game_id and g.get('uid') != game_id
            ]
            db.session.commit()
            
            return jsonify({
                "message": "Game removed successfully",
                "saved_games": user.saved_games
            }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/rawg/games', methods=['GET'])
def get_rawg_games():
    """Proxy endpoint for RAWG API games list"""
    try:
        # Verify RAWG_API_KEY is available
        if not RAWG_API_KEY:
            return jsonify({"error": "RAWG_API_KEY is not configured"}), 500
        
        page = request.args.get('page', '1')
        page_size = request.args.get('page_size', '20')
        search = request.args.get('search', '')
        
        url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&page={page}&page_size={page_size}"
        if search:
            url += f"&search={search}"
        
        print(f"[RAWG Proxy] Fetching: {url}")
        response = requests.get(url, timeout=10)
        print(f"[RAWG Proxy] Response status: {response.status_code}")
        response.raise_for_status()
        
        data = response.json()
        print(f"[RAWG Proxy] Successfully fetched {len(data.get('results', []))} games")
        return jsonify(data), 200
    except NameError as e:
        error_msg = f"Configuration error: {str(e)}"
        print(f"[RAWG Proxy] {error_msg}")
        return jsonify({"error": error_msg}), 500
    except requests.exceptions.Timeout:
        error_msg = "Request to RAWG API timed out"
        print(f"[RAWG Proxy] {error_msg}")
        return jsonify({"error": error_msg}), 500
    except requests.exceptions.RequestException as e:
        error_msg = f"Failed to fetch games from RAWG API: {str(e)}"
        print(f"[RAWG Proxy] {error_msg}")
        return jsonify({"error": error_msg}), 500
    except Exception as e:
        import traceback
        error_msg = f"Unexpected error: {str(e)}"
        traceback_str = traceback.format_exc()
        print(f"[RAWG Proxy] {error_msg}")
        print(traceback_str)
        return jsonify({"error": error_msg, "details": str(e), "traceback": traceback_str}), 500


@api.route('/rawg/games/<slug>', methods=['GET'])
def get_rawg_game_details(slug):
    """Proxy endpoint for RAWG API game details by slug"""
    try:
        url = f"https://api.rawg.io/api/games/{slug}?key={RAWG_API_KEY}"
        
        response = requests.get(url)
        response.raise_for_status()
        
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch game details from RAWG API: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/rawg/games/<int:game_id>/screenshots', methods=['GET'])
def get_rawg_game_screenshots(game_id):
    """Proxy endpoint for RAWG API game screenshots"""
    try:
        url = f"https://api.rawg.io/api/games/{game_id}/screenshots?key={RAWG_API_KEY}"
        
        response = requests.get(url)
        response.raise_for_status()
        
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch screenshots from RAWG API: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/rawg/games/<slug>/movies', methods=['GET'])
def get_rawg_game_movies(slug):
    """Proxy endpoint for RAWG API game movies/trailers"""
    try:
        url = f"https://api.rawg.io/api/games/{slug}/movies?key={RAWG_API_KEY}"
        
        response = requests.get(url)
        response.raise_for_status()
        
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch movies from RAWG API: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500