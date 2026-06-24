"""
ml/model.py — Random Forest career recommendation model
"""
import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from ml.dataset import (
    generate_dataset, ALL_SKILLS, ALL_INTERESTS, EDUCATION_LEVELS, CAREERS
)

MODEL_PATH    = os.path.join(os.path.dirname(__file__), "career_rf_model.pkl")
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), "encoders.pkl")

# ── Encoders (created once, reused) ─────────────────────────────────────
_mlb_skills    = MultiLabelBinarizer(classes=ALL_SKILLS)
_mlb_interests = MultiLabelBinarizer(classes=ALL_INTERESTS)
_le_edu        = LabelEncoder()
_le_career     = LabelEncoder()

# Fit the static encoders immediately
_mlb_skills.fit([ALL_SKILLS])
_mlb_interests.fit([ALL_INTERESTS])
_le_edu.fit(EDUCATION_LEVELS)
_le_career.fit(CAREERS)

_model = None   # RandomForestClassifier, loaded lazily


# ── Feature engineering ──────────────────────────────────────────────────

def _build_feature_matrix(df: pd.DataFrame) -> np.ndarray:
    """Convert a DataFrame with list columns into a numeric feature matrix."""
    skills_enc    = _mlb_skills.transform(df["skills"])
    interests_enc = _mlb_interests.transform(df["interests"])

    # Education: clamp unknowns to "Other" → encode → normalise 0-1
    edu_series = df["education"].apply(
        lambda e: e if e in EDUCATION_LEVELS else "Self-taught"
    )
    edu_enc = _le_edu.transform(edu_series).reshape(-1, 1) / len(EDUCATION_LEVELS)

    # Experience: clip at 20, normalise
    exp_enc = (
        df["years_of_experience"].clip(0, 20).values.reshape(-1, 1) / 20.0
    )

    return np.hstack([skills_enc, interests_enc, edu_enc, exp_enc])


# ── Training ─────────────────────────────────────────────────────────────

def train(n_samples: int = 5000, save: bool = True):
    """Generate data, train a Random Forest, optionally persist."""
    print(f"[ML] Generating {n_samples} synthetic samples …")
    df = generate_dataset(n_samples)

    X = _build_feature_matrix(df)
    y = _le_career.transform(df["career"])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("[ML] Training Random Forest …")
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"[ML] Test accuracy: {acc:.3f}")
    print(classification_report(y_test, y_pred, target_names=_le_career.classes_))

    if save:
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(clf, f)
        print(f"[ML] Model saved → {MODEL_PATH}")

    return clf, acc


def _load_model():
    """Load or train-then-save the model."""
    global _model
    if _model is not None:
        return _model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        print("[ML] Model loaded from disk.")
    else:
        print("[ML] No saved model found — training now …")
        _model, _ = train()
    return _model


# ── Prediction ───────────────────────────────────────────────────────────

def predict(
    skills: list,
    interests: list,
    education: str,
    years_of_experience: int,
    top_k: int = 5,
) -> list[dict]:
    """
    Returns top_k career recommendations with probability scores.
    Each item: {"career": str, "score": float, "rank": int}
    """
    model = _load_model()

    row = pd.DataFrame([{
        "skills": skills,
        "interests": interests,
        "education": education,
        "years_of_experience": years_of_experience,
    }])
    X = _build_feature_matrix(row)

    proba = model.predict_proba(X)[0]          # shape: (n_classes,)
    class_labels = _le_career.inverse_transform(model.classes_)

    paired = sorted(
        zip(class_labels, proba), key=lambda x: x[1], reverse=True
    )

    return [
        {"career": c, "score": round(float(s), 4), "rank": i + 1}
        for i, (c, s) in enumerate(paired[:top_k])
    ]


# ── Career metadata (for display) ────────────────────────────────────────

CAREER_META = {
    "Software Engineer":         {"icon": "💻", "avg_salary": "$110,000", "growth": "25%", "category": "Technology"},
    "Data Scientist":            {"icon": "📊", "avg_salary": "$120,000", "growth": "36%", "category": "Technology"},
    "UX/UI Designer":            {"icon": "🎨", "avg_salary": "$85,000",  "growth": "13%", "category": "Design"},
    "Product Manager":           {"icon": "📋", "avg_salary": "$115,000", "growth": "10%", "category": "Business"},
    "Cybersecurity Analyst":     {"icon": "🔐", "avg_salary": "$103,000", "growth": "35%", "category": "Technology"},
    "DevOps Engineer":           {"icon": "⚙️",  "avg_salary": "$118,000", "growth": "22%", "category": "Technology"},
    "Machine Learning Engineer": {"icon": "🤖", "avg_salary": "$130,000", "growth": "40%", "category": "Technology"},
    "Business Analyst":          {"icon": "📈", "avg_salary": "$85,000",  "growth": "11%", "category": "Business"},
    "Financial Analyst":         {"icon": "💰", "avg_salary": "$83,000",  "growth": "9%",  "category": "Finance"},
    "Digital Marketer":          {"icon": "📣", "avg_salary": "$65,000",  "growth": "10%", "category": "Marketing"},
    "Healthcare Administrator":  {"icon": "🏥", "avg_salary": "$98,000",  "growth": "28%", "category": "Healthcare"},
    "Biomedical Researcher":     {"icon": "🔬", "avg_salary": "$92,000",  "growth": "17%", "category": "Science"},
    "Graphic Designer":          {"icon": "🖌️", "avg_salary": "$55,000",  "growth": "3%",  "category": "Design"},
    "Content Writer":            {"icon": "✍️",  "avg_salary": "$50,000",  "growth": "9%",  "category": "Media"},
    "Environmental Scientist":   {"icon": "🌿", "avg_salary": "$73,000",  "growth": "8%",  "category": "Science"},
    "Teacher/Educator":          {"icon": "📚", "avg_salary": "$60,000",  "growth": "5%",  "category": "Education"},
    "Mechanical Engineer":       {"icon": "🔧", "avg_salary": "$90,000",  "growth": "7%",  "category": "Engineering"},
    "Electrical Engineer":       {"icon": "⚡", "avg_salary": "$95,000",  "growth": "11%", "category": "Engineering"},
    "Lawyer/Legal Analyst":      {"icon": "⚖️",  "avg_salary": "$120,000", "growth": "10%", "category": "Law"},
    "Social Worker":             {"icon": "🤝", "avg_salary": "$50,000",  "growth": "12%", "category": "Social"},
}


def enrich_recommendations(recs: list[dict]) -> list[dict]:
    for r in recs:
        meta = CAREER_META.get(r["career"], {})
        r.update(meta)
    return recs


if __name__ == "__main__":
    # Standalone test
    train(5000)
    results = predict(
        skills=["Python","Machine Learning","Data Analysis","Statistics"],
        interests=["Technology","Science","Research"],
        education="Master's",
        years_of_experience=3,
    )
    for r in results:
        print(r)
