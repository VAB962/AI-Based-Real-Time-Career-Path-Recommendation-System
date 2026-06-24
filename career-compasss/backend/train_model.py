"""
train_model.py — Run this once to pre-train and save the Random Forest model.

Usage:
    cd backend
    python train_model.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from ml.model import train

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    print(f"Training CareerCompass Random Forest on {n} samples…")
    clf, acc = train(n_samples=n, save=True)
    print(f"\n✅ Done! Model accuracy: {acc:.1%}")
    print("Model saved to backend/ml/career_rf_model.pkl")
