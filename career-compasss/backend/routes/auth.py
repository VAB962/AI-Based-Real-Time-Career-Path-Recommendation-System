"""
routes/auth.py — /api/auth  (register, login, me)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from bson import ObjectId

from models.database import get_db, new_user

auth_bp = Blueprint("auth", __name__)


def _serialize_user(user: dict) -> dict:
    """Return safe user dict (no password)."""
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "created_at": user["created_at"].isoformat(),
        "profile": user.get("profile", {}),
    }


# ── POST /api/auth/register ──────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email    = (data.get("email")    or "").strip().lower()
    password = data.get("password")  or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = get_db()
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username taken"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    doc = new_user(username, email, hashed)
    result = db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_access_token(identity=str(result.inserted_id))
    return jsonify({"token": token, "user": _serialize_user(doc)}), 201


# ── POST /api/auth/login ─────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email    = (data.get("email")    or "").strip().lower()
    password = (data.get("password") or "")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    db = get_db()
    user = db.users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token, "user": _serialize_user(user)}), 200


# ── GET /api/auth/me ─────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": _serialize_user(user)}), 200
