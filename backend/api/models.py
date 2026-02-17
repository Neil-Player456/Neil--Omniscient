from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, JSON


db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(Boolean(), nullable=False)
    about = db.Column(db.Text, nullable=True)
    saved_games = db.Column(JSON, default=[])

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "about": self.about,
            "saved_games": self.saved_games or []
        }
    


