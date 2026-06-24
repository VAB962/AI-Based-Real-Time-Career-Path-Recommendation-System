"""
routes/career.py — /api/career  (recommendations)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

from models.database import get_db, new_activity_log
from ml.model import predict, enrich_recommendations

career_bp = Blueprint("career", __name__)


@career_bp.route("/recommend", methods=["POST"])
@jwt_required()
def recommend():
    """
    POST body (JSON):
      skills             list[str]
      interests          list[str]
      education          str
      years_of_experience int
      top_k              int  (default 5)
    """
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    skills      = data.get("skills", [])
    interests   = data.get("interests", [])
    education   = data.get("education", "Bachelor's")
    experience  = int(data.get("years_of_experience", 0))
    top_k       = int(data.get("top_k", 5))

    if not skills and not interests:
        return jsonify({"error": "Provide at least some skills or interests"}), 400

    recs = predict(skills, interests, education, experience, top_k)
    recs = enrich_recommendations(recs)

    db = get_db()
    # Persist recommendation snapshot on user doc
    snapshot = {
        "timestamp": datetime.utcnow().isoformat(),
        "input": {"skills": skills, "interests": interests,
                  "education": education, "years_of_experience": experience},
        "results": recs,
    }
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"recommendation_history": {"$each": [snapshot], "$slice": -20}}}
    )
    # Activity log
    db.activity_logs.insert_one(
        new_activity_log(user_id, "get_recommendations", {"top_k": top_k})
    )

    return jsonify({"recommendations": recs}), 200


@career_bp.route("/history", methods=["GET"])
@jwt_required()
def history():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"history": list(reversed(user.get("recommendation_history", [])))}), 200
