"""
routes/profile.py — /api/profile  (get, update)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

from models.database import get_db

profile_bp = Blueprint("profile", __name__)

ALLOWED_SKILLS = [
    "Python","JavaScript","Java","C++","C#","Go","Rust","TypeScript",
    "SQL","NoSQL","React","Angular","Vue","Node.js","Django","Flask",
    "Machine Learning","Deep Learning","Data Analysis","Statistics",
    "Communication","Leadership","Project Management","Problem Solving",
    "Teamwork","Creativity","Critical Thinking","Marketing","Sales",
    "Graphic Design","UX/UI","Accounting","Finance","Biology","Chemistry",
    "Physics","Writing","Research","Teaching","Healthcare","Cybersecurity",
    "Cloud Computing","DevOps","Blockchain","Mobile Development",
]

ALLOWED_INTERESTS = [
    "Technology","Science","Art & Design","Business","Healthcare","Education",
    "Finance","Music","Gaming","Sports","Travel","Environment","Law","Media",
    "Engineering","Research","Entrepreneurship","Social Work","Politics","Fashion",
]


@profile_bp.route("/", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"profile": user.get("profile", {})}), 200


@profile_bp.route("/", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db = get_db()

    allowed_fields = [
        "full_name","education","field_of_study",
        "years_of_experience","skills","interests","location","bio",
    ]
    update = {}
    for field in allowed_fields:
        if field in data:
            update[f"profile.{field}"] = data[field]

    if not update:
        return jsonify({"error": "No valid fields provided"}), 400

    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})
    user = db.users.find_one({"_id": ObjectId(user_id)})
    return jsonify({"profile": user.get("profile", {})}), 200


@profile_bp.route("/options", methods=["GET"])
def get_options():
    """Return all valid skills, interests, education levels for the frontend."""
    return jsonify({
        "skills": ALLOWED_SKILLS,
        "interests": ALLOWED_INTERESTS,
        "education_levels": [
            "High School","Associate's","Bachelor's","Master's","PhD","Bootcamp","Self-taught","Other"
        ],
        "experience_ranges": [0, 1, 2, 3, 5, 7, 10, 15],
    }), 200
