# ⬡ CareerCompass

> AI-powered career path recommendation system with live job matching.
> Built with React.js · Flask · MongoDB · Random Forest (scikit-learn)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Tech Stack](#tech-stack)
5. [MongoDB Schema Design](#mongodb-schema-design)
6. [Random Forest ML Model](#random-forest-ml-model)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [System Flow](#system-flow)
9. [Quick Start (Manual)](#quick-start-manual)
10. [Quick Start (Docker)](#quick-start-docker)
11. [Dataset](#dataset)
12. [Frontend Pages](#frontend-pages)

---

## Project Overview

CareerCompass is a full-stack intelligent career guidance platform that:

- Accepts a user's **skills, interests, education level, and experience**
- Runs them through a trained **Random Forest classifier** to predict the top matching career paths
- Enriches each prediction with **salary data and growth statistics**
- Instantly surfaces **matching live job listings** for the predicted careers
- Stores all activity (recommendations, job clicks) in **MongoDB** per user

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React.js Frontend                     │
│  Login/Register · Dashboard · Profile · Recommend · Jobs│
└────────────────────────┬────────────────────────────────┘
                         │  HTTP / Axios (JWT Bearer)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Flask REST API (Python)                  │
│                                                          │
│  /api/auth      → Register, Login, Me                   │
│  /api/profile   → Get/Update profile, Options           │
│  /api/career    → AI Recommendations, History           │
│  /api/jobs      → Job listings, Click tracking          │
│                                                          │
│   ┌──────────────────────────────────────────────┐      │
│   │         Random Forest ML Module              │      │
│   │  dataset.py  →  5,000 synthetic samples      │      │
│   │  model.py    →  Training + Inference          │      │
│   │  career_rf_model.pkl  (persisted to disk)    │      │
│   └──────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────┘
                         │  pymongo
                         ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB (career_compass DB)                  │
│                                                          │
│  collections:  users · activity_logs · job_cache        │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
career-compass/
│
├── backend/
│   ├── app.py                  # Flask app factory + blueprint registration
│   ├── train_model.py          # Standalone model training script
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   │
│   ├── models/
│   │   └── database.py         # MongoDB connection + schema helpers
│   │
│   ├── routes/
│   │   ├── auth.py             # /api/auth (register, login, me)
│   │   ├── profile.py          # /api/profile (get, update, options)
│   │   ├── career.py           # /api/career (recommend, history)
│   │   └── jobs.py             # /api/jobs (list, click, recommended)
│   │
│   └── ml/
│       ├── dataset.py          # Synthetic 5,000-sample dataset generator
│       └── model.py            # Random Forest train/predict + career metadata
│
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── public/
│   │   └── index.html
│   │
│   └── src/
│       ├── App.js              # Router + route guards
│       ├── index.js
│       ├── index.css           # Global design system (CSS variables)
│       │
│       ├── context/
│       │   └── AuthContext.js  # JWT auth state (login/register/logout)
│       │
│       ├── utils/
│       │   └── api.js          # Axios instance with base URL + error interceptor
│       │
│       ├── components/
│       │   ├── Navbar.js / .css
│       │   ├── LoadingScreen.js
│       │   ├── TagSelector.js  # Multi-select pill cloud component
│       │   ├── CareerCard.js   # Career recommendation display card
│       │   └── JobCard.js      # Job listing card with apply tracking
│       │
│       └── pages/
│           ├── LoginPage.js / AuthPages.css
│           ├── RegisterPage.js
│           ├── DashboardPage.js / .css
│           ├── ProfilePage.js / .css
│           ├── RecommendPage.js / .css
│           ├── JobsPage.js / .css
│           └── HistoryPage.js / .css
│
└── docker-compose.yml
```

---

## Tech Stack

| Layer      | Technology               | Purpose                              |
|------------|--------------------------|--------------------------------------|
| Frontend   | React.js 18              | SPA with hooks + context             |
| Routing    | React Router v6          | Client-side navigation + guards      |
| HTTP       | Axios                    | API calls + JWT header injection     |
| Backend    | Flask 3.0 (Python 3.11)  | REST API + blueprint routing         |
| Auth       | Flask-JWT-Extended + bcrypt | Stateless token auth + password hash |
| Database   | MongoDB 7 + PyMongo      | Document store for users + activity  |
| ML         | scikit-learn             | Random Forest classifier             |
| Data       | pandas + numpy           | Feature engineering + data gen       |
| Container  | Docker + Docker Compose  | One-command local setup              |

---

## MongoDB Schema Design

### `users` collection

```json
{
  "_id": "ObjectId",
  "username": "string (unique, indexed)",
  "email": "string (unique, indexed)",
  "password_hash": "string (bcrypt)",
  "created_at": "ISODate",

  "profile": {
    "full_name": "string",
    "education": "string",
    "field_of_study": "string",
    "years_of_experience": "number",
    "skills": ["string"],
    "interests": ["string"],
    "location": "string",
    "bio": "string"
  },

  "recommendation_history": [
    {
      "timestamp": "ISOString",
      "input": {
        "skills": ["string"],
        "interests": ["string"],
        "education": "string",
        "years_of_experience": "number"
      },
      "results": [
        {
          "career": "string",
          "score": "float",
          "rank": "number",
          "icon": "string",
          "avg_salary": "string",
          "growth": "string",
          "category": "string"
        }
      ]
    }
  ],

  "job_click_history": [
    {
      "job_id": "string",
      "title": "string",
      "company": "string",
      "timestamp": "ISOString"
    }
  ]
}
```

### `activity_logs` collection

```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "action": "string",
  "metadata": "object",
  "timestamp": "ISODate"
}
```

**Indexes:**
- `users.email`    — unique ascending
- `users.username` — unique ascending
- `activity_logs.(user_id, timestamp)` — compound descending

---

## Random Forest ML Model

### Why Random Forest?

Random Forests are ideal here because they:
- Handle **mixed feature types** (binary skill flags + continuous experience + ordinal education)
- Are naturally **multi-class** (20 career output classes)
- Provide **class probabilities** via `predict_proba()` for confidence scoring
- Are **robust to overfitting** via ensemble of trees
- Require minimal feature scaling

### Feature Engineering

```
Input features (vector dimension = ~130):

  [0  … 64]  — MultiLabelBinarizer(skills)      binary, 65 skills
  [65 … 84]  — MultiLabelBinarizer(interests)   binary, 20 interests
  [85]       — LabelEncoder(education) / 8      normalised 0–1
  [86]       — years_of_experience / 20         normalised 0–1

Total: ~87 features per sample
```

### Training Dataset

- **5,000 synthetic samples** generated in `ml/dataset.py`
- 250 samples per career (20 careers × 250 = 5,000)
- Each sample: career-correlated skill/interest selection + realistic education + experience
- 80/20 train/test split, stratified by class
- Typical test accuracy: **~85–92%**

### Model Parameters

```python
RandomForestClassifier(
    n_estimators=200,    # 200 decision trees
    max_depth=None,      # trees grow until pure
    min_samples_split=4,
    min_samples_leaf=2,
    class_weight="balanced",  # handles class imbalance
    n_jobs=-1,           # parallel training
    random_state=42,
)
```

### Prediction Output

```json
[
  { "career": "Machine Learning Engineer", "score": 0.4820, "rank": 1, "icon": "🤖", "avg_salary": "$130,000", "growth": "40%", "category": "Technology" },
  { "career": "Data Scientist",            "score": 0.3145, "rank": 2, "icon": "📊", "avg_salary": "$120,000", "growth": "36%", "category": "Technology" },
  ...
]
```

---

## API Endpoints Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### Auth `/api/auth`

| Method | Endpoint          | Auth | Description                     |
|--------|-------------------|------|---------------------------------|
| POST   | `/register`       | No   | Create account, returns JWT     |
| POST   | `/login`          | No   | Validate credentials, returns JWT |
| GET    | `/me`             | Yes  | Get current user data           |

**POST /auth/register body:**
```json
{ "username": "jane", "email": "jane@example.com", "password": "secret123" }
```

**POST /auth/login body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response (both):**
```json
{ "token": "eyJ...", "user": { "id": "...", "username": "jane", "email": "...", "profile": {} } }
```

---

### Profile `/api/profile`

| Method | Endpoint     | Auth | Description                     |
|--------|--------------|------|---------------------------------|
| GET    | `/`          | Yes  | Get current user's profile      |
| PUT    | `/`          | Yes  | Update profile fields           |
| GET    | `/options`   | No   | Get valid skills/interests/etc  |

**PUT /profile/ body (any subset):**
```json
{
  "full_name": "Jane Doe",
  "education": "Master's",
  "field_of_study": "Computer Science",
  "years_of_experience": 3,
  "skills": ["Python", "Machine Learning", "SQL"],
  "interests": ["Technology", "Science"],
  "location": "San Francisco, CA",
  "bio": "Aspiring ML engineer"
}
```

---

### Career `/api/career`

| Method | Endpoint        | Auth | Description                           |
|--------|-----------------|------|---------------------------------------|
| POST   | `/recommend`    | Yes  | Run RF model, get top career matches  |
| GET    | `/history`      | Yes  | List past recommendation snapshots    |

**POST /career/recommend body:**
```json
{
  "skills": ["Python", "Machine Learning", "Statistics"],
  "interests": ["Technology", "Research"],
  "education": "Master's",
  "years_of_experience": 3,
  "top_k": 5
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "career": "Machine Learning Engineer",
      "score": 0.482,
      "rank": 1,
      "icon": "🤖",
      "avg_salary": "$130,000",
      "growth": "40%",
      "category": "Technology"
    }
  ]
}
```

---

### Jobs `/api/jobs`

| Method | Endpoint              | Auth | Description                          |
|--------|-----------------------|------|--------------------------------------|
| GET    | `/`                   | Yes  | List/search/filter job listings      |
| POST   | `/click/<job_id>`     | Yes  | Track job click + return apply URL   |
| POST   | `/recommended`        | Yes  | Get jobs matched to career list      |

**GET /jobs/ query params:**
- `careers` — comma-separated career categories
- `q` — keyword search (title/company)
- `limit` — max results (default 20, max 50)
- `offset` — pagination offset

**POST /jobs/recommended body:**
```json
{ "careers": ["Software Engineer", "Data Scientist"], "limit": 10 }
```

---

## System Flow

### 1. Registration & Onboarding
```
User → POST /auth/register
     → JWT token returned
     → Redirected to /profile
     → Fills skills, interests, education
     → PUT /profile/
     → Data stored in MongoDB users.profile
```

### 2. AI Recommendation Flow
```
User → /recommend (3-step wizard)
     Step 1: Select skills  (TagSelector)
     Step 2: Select interests (TagSelector)
     Step 3: Education + experience (form)
     
     → POST /career/recommend
         → ml/model.py::predict()
             → MultiLabelBinarizer(skills)
             → MultiLabelBinarizer(interests)
             → LabelEncoder(education)
             → normalize(experience)
             → RandomForestClassifier.predict_proba()
             → sort by probability
             → enrich with salary/growth metadata
         → Save snapshot to users.recommendation_history
         → Log to activity_logs
     
     → Results displayed as CareerCards with match %
     → POST /jobs/recommended (top 3 careers)
     → Matching jobs shown below results
```

### 3. Live Job Search Flow
```
User → /jobs
     → GET /api/jobs/?careers=...&q=...&limit=12
         → Filter in-memory job database (250 listings)
         → Paginate results
     → Click "Apply →"
         → POST /api/jobs/click/<id>
             → Log to users.job_click_history
             → Log to activity_logs
             → Return apply_url
         → Open job URL in new tab
```

### 4. Authentication Flow
```
Login  → POST /auth/login → JWT stored in localStorage
       → Axios adds "Authorization: Bearer <token>" to all requests
       
Refresh → GET /auth/me → Restore user object on app reload

Logout  → Clear localStorage token
        → Delete Axios header
        → Redirect to /login
```

---

## Quick Start (Manual)

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```bash
cd career-compass/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env config
cp .env.example .env

# Pre-train the Random Forest model (takes ~30 seconds)
python train_model.py

# Start Flask API
python app.py
# → Running on http://localhost:5000
```

### 2. Frontend

```bash
cd career-compass/frontend

# Install dependencies
npm install

# Start React dev server
npm start
# → Running on http://localhost:3000
```

### 3. Open the app

Navigate to **http://localhost:3000**, register a new account, complete your profile, and click "Get AI Recommendations".

---

## Quick Start (Docker)

```bash
cd career-compass

# Start all services (MongoDB + Backend + Frontend)
docker-compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:5000
#   MongoDB   → localhost:27017
```

---

## Dataset

The synthetic dataset (`ml/dataset.py`) generates **5,000 career profiles** with:

- **20 career categories** — from Software Engineer to Social Worker
- **65 skills** — technical (Python, React, ML) and soft (Leadership, Communication)
- **20 interest areas** — Technology, Science, Art & Design, Finance, etc.
- **8 education levels** — High School through PhD and Bootcamp
- **Realistic correlations** — each career has a weighted skill/interest profile
- Career-specific **salary ranges** and **job growth statistics**

To regenerate with more samples:
```bash
python train_model.py 10000   # 10,000 samples
```

---

## Frontend Pages

| Route        | Page              | Description                                      |
|--------------|-------------------|--------------------------------------------------|
| `/login`     | Login             | Email + password sign in                         |
| `/register`  | Register          | New account creation                             |
| `/dashboard` | Dashboard         | Stats, latest recommendations, featured jobs     |
| `/profile`   | Profile Editor    | Edit skills, interests, education, bio           |
| `/recommend` | AI Recommender    | 3-step wizard → ML predictions + matched jobs    |
| `/jobs`      | Job Board         | Searchable, filterable paginated job listings    |
| `/history`   | Activity History  | Past recommendations and job click log           |

---

## Environment Variables

| Variable        | Default                                  | Description             |
|-----------------|------------------------------------------|-------------------------|
| `JWT_SECRET_KEY`| `career-compass-secret-2024`             | JWT signing secret      |
| `MONGO_URI`     | `mongodb://localhost:27017/career_compass`| MongoDB connection URI  |
| `FLASK_ENV`     | `development`                            | Flask environment        |
| `REACT_APP_API_URL` | `http://localhost:5000/api`          | Frontend API base URL   |

---

*Built with ❤️ — CareerCompass v1.0*
