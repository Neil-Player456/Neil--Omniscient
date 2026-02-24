"""
API Routes Blueprint
This module defines all the API endpoints
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from api.models import db, User
from api.utils import APIException
import requests
import os

api = Blueprint('api', __name__)

@api.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 400
        
        new_user = User(
            email=email,
            password=password,  
            is_active=True
        )
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if user.password != password:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if not user.is_active:
            return jsonify({"error": "Account is inactive"}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "user": user.serialize(),
            "access_token": access_token
        }), 200
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@api.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user": user.serialize(),
            "access_token": request.headers.get('Authorization', '').replace('Bearer ', '')
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        if 'about' in data:
            user.about = data['about']
            db.session.commit()
        
        return jsonify({"user": user.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



RAWG_API_KEY = os.getenv('RAWG_API_KEY', '')
RAWG_BASE_URL = 'https://api.rawg.io/api'



@api.route('/retrogames', methods=['POST'])
def get_retro_games():
    try:
        data = request.get_json() or {}
        limit = data.get('limit', 40)
        offset = data.get('offset', 0)

        url = f"{RAWG_BASE_URL}/games"

        params = {
            "key": RAWG_API_KEY,
            "dates": "1980-01-01,2000-12-31",
            "page_size": limit,
            "page": (offset // limit) + 1,
            "ordering": "-rating"
        }

        response = requests.get(url, params=params)

        if response.status_code == 200:
            results = response.json().get("results", [])
            return jsonify(results), 200
        else:
            return jsonify({"error": response.text}), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/rawg/games', methods=['GET'])
def get_rawg_games():
    try:
        url = f"{RAWG_BASE_URL}/games"
        params = {
            'key': RAWG_API_KEY,
            'page_size': 20
        }
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            return jsonify({"results": data.get('results', [])}), 200
        else:
            return jsonify({"error": "Failed to fetch games from RAWG"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/rawg/games/<slug>', methods=['GET'])
def get_rawg_game_detail(slug):
    try:
        url = f"{RAWG_BASE_URL}/games/{slug}"
        params = {'key': RAWG_API_KEY}
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({"error": "Game not found"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/saved-games', methods=['GET'])
@jwt_required()
def get_saved_games():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user.saved_games or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/saved-games', methods=['PUT'])
@jwt_required()
def save_game():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        game = data.get('game')
        
        if not game:
            return jsonify({"error": "Game data is required"}), 400
        
        if user.saved_games is None:
            user.saved_games = []
        
        game_id = game.get('id')
        if game_id:
            user.saved_games = [g for g in user.saved_games if g.get('id') != game_id]
        
        user.saved_games.append(game)
        db.session.commit()
        
        return jsonify({"saved_games": user.saved_games}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/saved-games', methods=['DELETE'])
@jwt_required()
def remove_saved_game():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        game_id = data.get('game_id')
        
        if not game_id:
            return jsonify({"error": "game_id is required"}), 400
        
        if user.saved_games:
            user.saved_games = [g for g in user.saved_games if g.get('id') != game_id]
            db.session.commit()
        
        return jsonify({"saved_games": user.saved_games or []}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
