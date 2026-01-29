"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, create_access_token, jwt_required
import hashlib
import requests




api = Blueprint('api', __name__)
CORS(api)

CLIENT_ID = "2r3wcled8ugszufen3r4r2makgitqq"
CLIENT_SECRET = "j518b3kme8d7lmw8yr6mfwa26n6wxq"  


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