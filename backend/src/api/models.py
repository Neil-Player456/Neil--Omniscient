from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column


db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    about = db.Column(db.Text, nullable=True)
    saved_games = db.Column(JSON, default=[])

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "about": self.about,
            "saved_games": self.saved_games or []
        }
    


