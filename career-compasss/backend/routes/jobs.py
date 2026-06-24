"""
routes/jobs.py — /api/jobs  (live job listings + click tracking)
"""
import random
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

from models.database import get_db, new_activity_log

jobs_bp = Blueprint("jobs", __name__)

# ── Simulated job database (250 listings) ────────────────────────────────

COMPANIES = [
    "Google","Microsoft","Amazon","Meta","Apple","Netflix","Uber","Airbnb",
    "Stripe","Salesforce","IBM","Oracle","Cisco","Intel","NVIDIA",
    "Deloitte","McKinsey","PwC","Accenture","Bloomberg",
    "Mayo Clinic","Johns Hopkins","Kaiser Permanente",
    "The New York Times","Spotify","Twitch","Riot Games",
    "Tesla","SpaceX","Rivian","Siemens","GE","Boeing",
    "Pfizer","Moderna","BioNTech","GSK","AstraZeneca",
    "JPMorgan Chase","Goldman Sachs","Morgan Stanley","BlackRock",
    "Teach For America","Khan Academy","Coursera","Duolingo",
    "Greenpeace","WWF","NOAA","NASA","NIH",
]

LOCATIONS = [
    "San Francisco, CA","New York, NY","Austin, TX","Seattle, WA",
    "Boston, MA","Chicago, IL","Remote","Los Angeles, CA",
    "Denver, CO","Atlanta, GA","London, UK","Berlin, Germany",
    "Toronto, Canada","Singapore","Hybrid",
]

CAREER_JOB_TITLES = {
    "Software Engineer":         ["Software Engineer","Backend Developer","Frontend Developer","Full Stack Engineer","Senior SWE","Staff Engineer"],
    "Data Scientist":            ["Data Scientist","Senior Data Scientist","ML Data Analyst","Applied Scientist","Research Scientist"],
    "UX/UI Designer":            ["UX Designer","UI Designer","Product Designer","Senior UX Researcher","Interaction Designer"],
    "Product Manager":           ["Product Manager","Senior PM","Group Product Manager","Associate PM","Technical PM"],
    "Cybersecurity Analyst":     ["Cybersecurity Analyst","Security Engineer","Penetration Tester","SOC Analyst","InfoSec Engineer"],
    "DevOps Engineer":           ["DevOps Engineer","Site Reliability Engineer","Platform Engineer","Cloud Engineer","Infrastructure Engineer"],
    "Machine Learning Engineer": ["ML Engineer","AI Engineer","Research Engineer","Deep Learning Engineer","NLP Engineer"],
    "Business Analyst":          ["Business Analyst","Senior BA","Strategy Analyst","Operations Analyst","Systems Analyst"],
    "Financial Analyst":         ["Financial Analyst","Investment Analyst","Quantitative Analyst","Risk Analyst","FP&A Analyst"],
    "Digital Marketer":          ["Digital Marketing Manager","SEO Specialist","Growth Marketer","Performance Marketer","Content Strategist"],
    "Healthcare Administrator":  ["Healthcare Admin","Hospital Operations Manager","Clinical Coordinator","Health Systems Analyst","Practice Manager"],
    "Biomedical Researcher":     ["Research Scientist","Biomedical Engineer","Lab Scientist","Clinical Research Associate","Computational Biologist"],
    "Graphic Designer":          ["Graphic Designer","Visual Designer","Brand Designer","Motion Designer","Creative Director"],
    "Content Writer":            ["Content Writer","Technical Writer","Copywriter","Blog Editor","Communications Specialist"],
    "Environmental Scientist":   ["Environmental Scientist","Sustainability Analyst","Ecologist","Climate Analyst","Environmental Consultant"],
    "Teacher/Educator":          ["High School Teacher","Curriculum Designer","Instructional Coach","E-Learning Developer","Education Specialist"],
    "Mechanical Engineer":       ["Mechanical Engineer","Design Engineer","Systems Engineer","Manufacturing Engineer","R&D Engineer"],
    "Electrical Engineer":       ["Electrical Engineer","Electronics Engineer","Power Systems Engineer","RF Engineer","Hardware Engineer"],
    "Lawyer/Legal Analyst":      ["Legal Analyst","Contract Specialist","Compliance Officer","Legal Counsel","Paralegal"],
    "Social Worker":             ["Social Worker","Case Manager","Community Outreach Coordinator","Mental Health Counselor","Program Manager"],
}

SALARY_RANGES = {
    "Software Engineer":         ("$95,000","$165,000"),
    "Data Scientist":            ("$105,000","$175,000"),
    "UX/UI Designer":            ("$75,000","$130,000"),
    "Product Manager":           ("$100,000","$180,000"),
    "Cybersecurity Analyst":     ("$90,000","$150,000"),
    "DevOps Engineer":           ("$100,000","$160,000"),
    "Machine Learning Engineer": ("$115,000","$200,000"),
    "Business Analyst":          ("$70,000","$120,000"),
    "Financial Analyst":         ("$70,000","$120,000"),
    "Digital Marketer":          ("$55,000","$100,000"),
    "Healthcare Administrator":  ("$80,000","$130,000"),
    "Biomedical Researcher":     ("$75,000","$130,000"),
    "Graphic Designer":          ("$48,000","$90,000"),
    "Content Writer":            ("$42,000","$85,000"),
    "Environmental Scientist":   ("$60,000","$100,000"),
    "Teacher/Educator":          ("$45,000","$80,000"),
    "Mechanical Engineer":       ("$75,000","$130,000"),
    "Electrical Engineer":       ("$80,000","$140,000"),
    "Lawyer/Legal Analyst":      ("$90,000","$200,000"),
    "Social Worker":             ("$42,000","$75,000"),
}

REQUIRED_SKILLS_MAP = {
    "Software Engineer":         [["Python","JavaScript"],["React","Node.js"],["Java","SQL"]],
    "Data Scientist":            [["Python","Machine Learning"],["SQL","Statistics"],["Deep Learning","TensorFlow"]],
    "UX/UI Designer":            [["UX/UI","Figma"],["Creativity","Communication"],["Graphic Design","Prototyping"]],
    "Product Manager":           [["Leadership","Communication"],["Data Analysis","Project Management"],["Agile","Roadmapping"]],
    "Cybersecurity Analyst":     [["Cybersecurity","Networking"],["Python","Penetration Testing"],["SIEM","Threat Analysis"]],
    "DevOps Engineer":           [["Docker","Kubernetes"],["Cloud Computing","CI/CD"],["Python","Terraform"]],
    "Machine Learning Engineer": [["Machine Learning","Python"],["Deep Learning","TensorFlow"],["MLOps","Statistics"]],
    "Business Analyst":          [["SQL","Data Analysis"],["Communication","Excel"],["Requirements Gathering","Agile"]],
    "Financial Analyst":         [["Finance","Excel"],["SQL","Statistics"],["Financial Modeling","Bloomberg"]],
    "Digital Marketer":          [["SEO","Google Analytics"],["Marketing","Social Media"],["Copywriting","CRM"]],
    "Healthcare Administrator":  [["Healthcare","Leadership"],["Project Management","EMR"],["Compliance","Communication"]],
    "Biomedical Researcher":     [["Biology","Research"],["Statistics","Python"],["Lab Skills","Data Analysis"]],
    "Graphic Designer":          [["Adobe Suite","Creativity"],["Figma","Illustration"],["Branding","Typography"]],
    "Content Writer":            [["Writing","SEO"],["Research","Storytelling"],["CMS","Editing"]],
    "Environmental Scientist":   [["Biology","GIS"],["Environmental Science","Research"],["Chemistry","Data Analysis"]],
    "Teacher/Educator":          [["Communication","Teaching"],["Curriculum Design","Patience"],["EdTech","Lesson Planning"]],
    "Mechanical Engineer":       [["CAD","Physics"],["SolidWorks","Problem Solving"],["FEA","Manufacturing"]],
    "Electrical Engineer":       [["Electronics","MATLAB"],["Circuit Design","C++"],["PCB","Embedded Systems"]],
    "Lawyer/Legal Analyst":      [["Research","Writing"],["Legal Analysis","Communication"],["Contract Law","Compliance"]],
    "Social Worker":             [["Communication","Empathy"],["Case Management","Social Work"],["Crisis Intervention","Advocacy"]],
}

def _generate_jobs(n: int = 250) -> list[dict]:
    rng = random.Random(99)
    jobs = []
    job_id = 1
    careers = list(CAREER_JOB_TITLES.keys())
    per = n // len(careers)
    for career in careers:
        titles = CAREER_JOB_TITLES[career]
        salary = SALARY_RANGES.get(career, ("$50,000","$100,000"))
        skill_variants = REQUIRED_SKILLS_MAP.get(career, [["Communication"]])
        for _ in range(per):
            posted_days_ago = rng.randint(0, 30)
            jobs.append({
                "id": f"job_{job_id:04d}",
                "title": rng.choice(titles),
                "company": rng.choice(COMPANIES),
                "location": rng.choice(LOCATIONS),
                "career_category": career,
                "salary_min": salary[0],
                "salary_max": salary[1],
                "required_skills": rng.choice(skill_variants),
                "job_type": rng.choice(["Full-time","Full-time","Full-time","Part-time","Contract"]),
                "experience_required": f"{rng.randint(0,8)}+ years",
                "posted_at": (datetime.utcnow() - timedelta(days=posted_days_ago)).strftime("%Y-%m-%d"),
                "apply_url": f"https://careers.example.com/jobs/{job_id:04d}",
                "description": (
                    f"We are looking for a talented {rng.choice(titles)} to join our team. "
                    f"You will work on cutting-edge problems in {career} and collaborate with "
                    "world-class engineers and researchers."
                ),
            })
            job_id += 1
    return jobs

_JOB_DB = _generate_jobs(250)


# ── Routes ───────────────────────────────────────────────────────────────

@jobs_bp.route("/", methods=["GET"])
@jwt_required()
def list_jobs():
    """
    Query params:
      careers  comma-separated list of career categories to filter
      q        keyword search (title / company)
      limit    default 20
      offset   default 0
    """
    careers_param = request.args.get("careers", "")
    q             = (request.args.get("q", "") or "").lower()
    limit         = min(int(request.args.get("limit",  20)), 50)
    offset        = int(request.args.get("offset", 0))

    filtered = _JOB_DB[:]

    if careers_param:
        career_list = [c.strip() for c in careers_param.split(",") if c.strip()]
        filtered = [j for j in filtered if j["career_category"] in career_list]

    if q:
        filtered = [
            j for j in filtered
            if q in j["title"].lower() or q in j["company"].lower()
        ]

    total = len(filtered)
    page  = filtered[offset: offset + limit]
    return jsonify({"jobs": page, "total": total, "limit": limit, "offset": offset}), 200


@jobs_bp.route("/click/<job_id>", methods=["POST"])
@jwt_required()
def job_click(job_id):
    user_id = get_jwt_identity()
    job = next((j for j in _JOB_DB if j["id"] == job_id), None)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    db = get_db()
    entry = {
        "job_id": job_id,
        "title": job["title"],
        "company": job["company"],
        "timestamp": datetime.utcnow().isoformat(),
    }
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"job_click_history": {"$each": [entry], "$slice": -50}}}
    )
    db.activity_logs.insert_one(
        new_activity_log(user_id, "job_click", {"job_id": job_id, "title": job["title"]})
    )
    return jsonify({"status": "tracked", "apply_url": job["apply_url"]}), 200


@jobs_bp.route("/recommended", methods=["POST"])
@jwt_required()
def recommended_jobs():
    """
    Given a list of career names, return matching jobs ranked by relevance.
    Body: { "careers": ["Software Engineer", "Data Scientist"], "limit": 10 }
    """
    data    = request.get_json(silent=True) or {}
    careers = data.get("careers", [])
    limit   = min(int(data.get("limit", 10)), 30)

    if not careers:
        return jsonify({"jobs": []}), 200

    matched = [j for j in _JOB_DB if j["career_category"] in careers]
    random.shuffle(matched)
    return jsonify({"jobs": matched[:limit]}), 200
