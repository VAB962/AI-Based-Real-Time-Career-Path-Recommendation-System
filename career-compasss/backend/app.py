"""
CareerCompass Backend — Flask Application Entry Point
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.career import career_bp
from routes.jobs import jobs_bp
from routes.quiz import quiz_bp
from models.database import init_db

load_dotenv()

def create_app():
    app = Flask(__name__)

    # ── Config ──────────────────────────────────────────────────────────
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "career-compass-secret-2024")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False   # long-lived for demo
    app.config["MONGO_URI"] = os.getenv(
        "MONGO_URI", "mongodb://localhost:27017/career_compass"
    )

    # ── Extensions ───────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)
    init_db(app)

    # ── Blueprints ───────────────────────────────────────────────────────
    app.register_blueprint(auth_bp,    url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(career_bp,  url_prefix="/api/career")
    app.register_blueprint(jobs_bp,    url_prefix="/api/jobs")
    app.register_blueprint(quiz_bp,    url_prefix="/api/quiz")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "CareerCompass API v1.0"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
