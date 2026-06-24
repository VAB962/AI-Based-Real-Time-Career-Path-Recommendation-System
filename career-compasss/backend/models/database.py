"""
models/database.py — MongoDB connection + schema helpers
"""
from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
import os

_client: MongoClient = None
_db = None


def init_db(app):
    """Attach MongoDB to the Flask app (call once in create_app)."""
    global _client, _db
    _client = MongoClient(app.config["MONGO_URI"])
    _db = _client.get_default_database()

    # ── Indexes ──────────────────────────────────────────────────────────
    _db.users.create_index([("email", ASCENDING)], unique=True)
    _db.users.create_index([("username", ASCENDING)], unique=True)
    _db.activity_logs.create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
    _db.job_cache.create_index([("fetched_at", DESCENDING)])

    print(f"[DB] Connected to MongoDB: {_db.name}")


def get_db():
    """Return the active database handle."""
    if _db is None:
        raise RuntimeError("Database not initialised. Call init_db() first.")
    return _db


# ── Schema factories (dict-based, schema-less Mongo style) ──────────────

def new_user(username: str, email: str, password_hash: str) -> dict:
    return {
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "created_at": datetime.utcnow(),
        "profile": {
            "full_name": "",
            "education": "",          # e.g. "Bachelor's"
            "field_of_study": "",
            "years_of_experience": 0,
            "skills": [],             # list[str]
            "interests": [],          # list[str]
            "location": "",
            "bio": "",
        },
        "recommendation_history": [], # list of recommendation snapshots
        "job_click_history": [],       # list of {job_id, title, timestamp}
    }


def new_activity_log(user_id: str, action: str, metadata: dict = None) -> dict:
    return {
        "user_id": user_id,
        "action": action,          # e.g. "get_recommendations", "job_click"
        "metadata": metadata or {},
        "timestamp": datetime.utcnow(),
    }
