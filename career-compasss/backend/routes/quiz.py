"""
routes/quiz.py — /api/quiz  (20-question interest quiz + roadmap)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

from models.database import get_db, new_activity_log
from ml.model import predict, enrich_recommendations

quiz_bp = Blueprint("quiz", __name__)

# ── 20 Questions ─────────────────────────────────────────────────────────

QUESTIONS = [
    {
        "id": 1,
        "category": "work_style",
        "question": "How do you prefer to spend most of your working hours?",
        "options": [
            {"label": "Building or coding things",        "tags": ["Software Engineer","DevOps Engineer","Machine Learning Engineer","Electrical Engineer","Mechanical Engineer"]},
            {"label": "Analysing data and finding patterns", "tags": ["Data Scientist","Financial Analyst","Business Analyst","Biomedical Researcher","Environmental Scientist"]},
            {"label": "Designing visuals or experiences",  "tags": ["UX/UI Designer","Graphic Designer","Digital Marketer","Content Writer"]},
            {"label": "Leading teams or managing projects", "tags": ["Product Manager","Healthcare Administrator","Teacher/Educator","Social Worker"]},
        ],
    },
    {
        "id": 2,
        "category": "environment",
        "question": "Which work environment excites you most?",
        "options": [
            {"label": "Tech office / startup",             "tags": ["Software Engineer","Product Manager","DevOps Engineer","Machine Learning Engineer","UX/UI Designer"]},
            {"label": "Research lab or university",        "tags": ["Biomedical Researcher","Environmental Scientist","Data Scientist","Electrical Engineer"]},
            {"label": "Creative studio or agency",         "tags": ["Graphic Designer","Content Writer","Digital Marketer","UX/UI Designer"]},
            {"label": "Hospital, school, or public sector","tags": ["Healthcare Administrator","Teacher/Educator","Social Worker","Lawyer/Legal Analyst"]},
        ],
    },
    {
        "id": 3,
        "category": "subject",
        "question": "Which subject did you enjoy most in school?",
        "options": [
            {"label": "Mathematics or Computer Science",   "tags": ["Software Engineer","Data Scientist","Machine Learning Engineer","Financial Analyst","Electrical Engineer"]},
            {"label": "Biology or Chemistry",              "tags": ["Biomedical Researcher","Environmental Scientist","Healthcare Administrator"]},
            {"label": "Art, Design or Literature",         "tags": ["Graphic Designer","Content Writer","UX/UI Designer","Digital Marketer"]},
            {"label": "Economics, Law or Social Studies",  "tags": ["Business Analyst","Financial Analyst","Lawyer/Legal Analyst","Social Worker","Teacher/Educator"]},
        ],
    },
    {
        "id": 4,
        "category": "motivation",
        "question": "What motivates you most at work?",
        "options": [
            {"label": "Solving hard technical problems",   "tags": ["Software Engineer","Machine Learning Engineer","Cybersecurity Analyst","Electrical Engineer","Mechanical Engineer"]},
            {"label": "Making a social impact",            "tags": ["Social Worker","Teacher/Educator","Healthcare Administrator","Environmental Scientist"]},
            {"label": "Creative expression and innovation","tags": ["UX/UI Designer","Graphic Designer","Content Writer","Product Manager"]},
            {"label": "Financial growth and strategy",     "tags": ["Financial Analyst","Business Analyst","Product Manager","Lawyer/Legal Analyst"]},
        ],
    },
    {
        "id": 5,
        "category": "tools",
        "question": "Which tools or activities feel most natural to you?",
        "options": [
            {"label": "Writing code and debugging",        "tags": ["Software Engineer","DevOps Engineer","Machine Learning Engineer","Cybersecurity Analyst"]},
            {"label": "Spreadsheets, charts, and reports", "tags": ["Data Scientist","Financial Analyst","Business Analyst"]},
            {"label": "Sketch, Figma, Photoshop",          "tags": ["UX/UI Designer","Graphic Designer","Digital Marketer"]},
            {"label": "Presentations, writing, or teaching","tags": ["Content Writer","Teacher/Educator","Product Manager","Social Worker"]},
        ],
    },
    {
        "id": 6,
        "category": "impact",
        "question": "What kind of impact do you want your work to have?",
        "options": [
            {"label": "Power products used by millions",   "tags": ["Software Engineer","Product Manager","Machine Learning Engineer","DevOps Engineer"]},
            {"label": "Advance scientific knowledge",      "tags": ["Biomedical Researcher","Data Scientist","Environmental Scientist","Electrical Engineer"]},
            {"label": "Shape culture through creativity",  "tags": ["Graphic Designer","Content Writer","Digital Marketer","UX/UI Designer"]},
            {"label": "Protect and help individuals",      "tags": ["Lawyer/Legal Analyst","Social Worker","Healthcare Administrator","Teacher/Educator"]},
        ],
    },
    {
        "id": 7,
        "category": "strength",
        "question": "What is your biggest personal strength?",
        "options": [
            {"label": "Logical thinking and precision",    "tags": ["Software Engineer","Data Scientist","Cybersecurity Analyst","Financial Analyst","Electrical Engineer"]},
            {"label": "Empathy and communication",         "tags": ["Social Worker","Teacher/Educator","Healthcare Administrator","UX/UI Designer"]},
            {"label": "Visual thinking and creativity",    "tags": ["Graphic Designer","UX/UI Designer","Content Writer","Digital Marketer"]},
            {"label": "Strategy and leadership",           "tags": ["Product Manager","Business Analyst","Lawyer/Legal Analyst","Financial Analyst"]},
        ],
    },
    {
        "id": 8,
        "category": "learning",
        "question": "How do you prefer to learn new things?",
        "options": [
            {"label": "Hands-on coding or experiments",    "tags": ["Software Engineer","Machine Learning Engineer","DevOps Engineer","Biomedical Researcher"]},
            {"label": "Reading papers and doing research", "tags": ["Data Scientist","Biomedical Researcher","Environmental Scientist","Lawyer/Legal Analyst"]},
            {"label": "Watching tutorials and practising visually", "tags": ["Graphic Designer","UX/UI Designer","Digital Marketer"]},
            {"label": "Workshops, discussions, and teaching others", "tags": ["Teacher/Educator","Social Worker","Product Manager","Business Analyst"]},
        ],
    },
    {
        "id": 9,
        "category": "tech",
        "question": "How comfortable are you with technology?",
        "options": [
            {"label": "I love deep technical work (code, systems)", "tags": ["Software Engineer","Machine Learning Engineer","DevOps Engineer","Cybersecurity Analyst","Electrical Engineer"]},
            {"label": "I use tech as a tool for analysis",  "tags": ["Data Scientist","Financial Analyst","Business Analyst","Environmental Scientist"]},
            {"label": "I use tech for creative work",       "tags": ["Graphic Designer","UX/UI Designer","Digital Marketer","Content Writer"]},
            {"label": "I prefer working with people, not tech", "tags": ["Social Worker","Teacher/Educator","Healthcare Administrator","Lawyer/Legal Analyst"]},
        ],
    },
    {
        "id": 10,
        "category": "problem",
        "question": "When faced with a difficult problem, you typically:",
        "options": [
            {"label": "Break it into logical steps and code a solution", "tags": ["Software Engineer","Machine Learning Engineer","Data Scientist","Electrical Engineer"]},
            {"label": "Research deeply and form a strategy", "tags": ["Business Analyst","Financial Analyst","Lawyer/Legal Analyst","Biomedical Researcher"]},
            {"label": "Sketch ideas and prototype visually", "tags": ["UX/UI Designer","Graphic Designer","Product Manager"]},
            {"label": "Talk to people and find a human solution", "tags": ["Social Worker","Teacher/Educator","Healthcare Administrator","Digital Marketer"]},
        ],
    },
    {
        "id": 11,
        "category": "industry",
        "question": "Which industry excites you most?",
        "options": [
            {"label": "Artificial Intelligence & Software", "tags": ["Machine Learning Engineer","Software Engineer","Data Scientist","DevOps Engineer"]},
            {"label": "Finance & Business",                 "tags": ["Financial Analyst","Business Analyst","Product Manager","Lawyer/Legal Analyst"]},
            {"label": "Healthcare & Life Sciences",         "tags": ["Healthcare Administrator","Biomedical Researcher","Social Worker","Environmental Scientist"]},
            {"label": "Media, Design & Marketing",          "tags": ["Graphic Designer","Content Writer","Digital Marketer","UX/UI Designer"]},
        ],
    },
    {
        "id": 12,
        "category": "team",
        "question": "What's your ideal team setup?",
        "options": [
            {"label": "Small engineering squad, deep focus",   "tags": ["Software Engineer","Machine Learning Engineer","Cybersecurity Analyst","DevOps Engineer"]},
            {"label": "Cross-functional team with analysts",   "tags": ["Product Manager","Business Analyst","Data Scientist","Financial Analyst"]},
            {"label": "Creative team — designers and writers", "tags": ["UX/UI Designer","Graphic Designer","Content Writer","Digital Marketer"]},
            {"label": "Community-oriented team helping people","tags": ["Teacher/Educator","Social Worker","Healthcare Administrator"]},
        ],
    },
    {
        "id": 13,
        "category": "output",
        "question": "What output makes you most proud?",
        "options": [
            {"label": "A working app, model, or system",    "tags": ["Software Engineer","Machine Learning Engineer","DevOps Engineer","Electrical Engineer","Mechanical Engineer"]},
            {"label": "A compelling report or data insight","tags": ["Data Scientist","Financial Analyst","Business Analyst","Environmental Scientist"]},
            {"label": "A beautiful design or piece of content", "tags": ["Graphic Designer","UX/UI Designer","Content Writer","Digital Marketer"]},
            {"label": "A person whose life you improved",   "tags": ["Teacher/Educator","Social Worker","Healthcare Administrator","Lawyer/Legal Analyst"]},
        ],
    },
    {
        "id": 14,
        "category": "risk",
        "question": "How do you feel about risk and uncertainty?",
        "options": [
            {"label": "Love it — I thrive in ambiguous technical challenges", "tags": ["Machine Learning Engineer","Cybersecurity Analyst","Software Engineer","DevOps Engineer"]},
            {"label": "I manage it — I build models and strategies",           "tags": ["Financial Analyst","Business Analyst","Data Scientist","Product Manager"]},
            {"label": "I embrace creative risk",                               "tags": ["Graphic Designer","Content Writer","UX/UI Designer","Digital Marketer"]},
            {"label": "I prefer stable, structured environments",              "tags": ["Teacher/Educator","Healthcare Administrator","Lawyer/Legal Analyst","Social Worker"]},
        ],
    },
    {
        "id": 15,
        "category": "values",
        "question": "Which value matters most to you professionally?",
        "options": [
            {"label": "Innovation — building what's never been built", "tags": ["Machine Learning Engineer","Software Engineer","Product Manager","DevOps Engineer"]},
            {"label": "Accuracy — being right and thorough",           "tags": ["Data Scientist","Financial Analyst","Biomedical Researcher","Cybersecurity Analyst"]},
            {"label": "Aesthetics — making things beautiful",          "tags": ["Graphic Designer","UX/UI Designer","Content Writer","Digital Marketer"]},
            {"label": "Justice / Care — making the world fairer",      "tags": ["Lawyer/Legal Analyst","Social Worker","Teacher/Educator","Healthcare Administrator"]},
        ],
    },
    {
        "id": 16,
        "category": "hobby",
        "question": "What do you do in your free time that could relate to a career?",
        "options": [
            {"label": "Build side projects, tinker with code or hardware", "tags": ["Software Engineer","Machine Learning Engineer","Electrical Engineer","DevOps Engineer"]},
            {"label": "Read about markets, science, or current events",    "tags": ["Financial Analyst","Business Analyst","Environmental Scientist","Biomedical Researcher"]},
            {"label": "Draw, design, write, or create content",            "tags": ["Graphic Designer","UX/UI Designer","Content Writer","Digital Marketer"]},
            {"label": "Volunteer, mentor, or help others",                 "tags": ["Teacher/Educator","Social Worker","Healthcare Administrator"]},
        ],
    },
    {
        "id": 17,
        "category": "salary_vs_purpose",
        "question": "What's more important to you — salary or purpose?",
        "options": [
            {"label": "High salary is a priority",          "tags": ["Machine Learning Engineer","Software Engineer","Financial Analyst","Lawyer/Legal Analyst","DevOps Engineer"]},
            {"label": "Balance of both",                    "tags": ["Product Manager","Data Scientist","Business Analyst","UX/UI Designer","Cybersecurity Analyst"]},
            {"label": "Purpose and creativity first",       "tags": ["Graphic Designer","Content Writer","Digital Marketer","Teacher/Educator"]},
            {"label": "Making a difference, even if lower pay", "tags": ["Social Worker","Teacher/Educator","Environmental Scientist","Healthcare Administrator"]},
        ],
    },
    {
        "id": 18,
        "category": "scale",
        "question": "Do you prefer working on one deep speciality or across many areas?",
        "options": [
            {"label": "Deep specialist — one domain, mastered", "tags": ["Machine Learning Engineer","Cybersecurity Analyst","Electrical Engineer","Biomedical Researcher","Data Scientist"]},
            {"label": "Broad strategist — across business/tech","tags": ["Product Manager","Business Analyst","Financial Analyst","DevOps Engineer"]},
            {"label": "Creative generalist — design, write, market", "tags": ["Digital Marketer","Content Writer","Graphic Designer","UX/UI Designer"]},
            {"label": "Human connector — across communities",  "tags": ["Teacher/Educator","Social Worker","Healthcare Administrator","Lawyer/Legal Analyst"]},
        ],
    },
    {
        "id": 19,
        "category": "future",
        "question": "Where do you see yourself in 10 years?",
        "options": [
            {"label": "CTO, Lead Engineer, or AI Researcher",  "tags": ["Machine Learning Engineer","Software Engineer","Data Scientist","DevOps Engineer"]},
            {"label": "CFO, Strategy Director, or Entrepreneur","tags": ["Financial Analyst","Business Analyst","Product Manager","Lawyer/Legal Analyst"]},
            {"label": "Creative Director, Editor, or Brand Lead","tags": ["Graphic Designer","Content Writer","Digital Marketer","UX/UI Designer"]},
            {"label": "Principal, Director of Care, or Community Leader", "tags": ["Teacher/Educator","Healthcare Administrator","Social Worker","Environmental Scientist"]},
        ],
    },
    {
        "id": 20,
        "category": "proud_of",
        "question": "Which achievement would make you most proud?",
        "options": [
            {"label": "Shipping a product used by millions",   "tags": ["Software Engineer","Product Manager","Machine Learning Engineer","DevOps Engineer"]},
            {"label": "Publishing a groundbreaking study",     "tags": ["Biomedical Researcher","Data Scientist","Environmental Scientist","Electrical Engineer"]},
            {"label": "Creating a campaign or design that went viral", "tags": ["Digital Marketer","Graphic Designer","Content Writer","UX/UI Designer"]},
            {"label": "Changing someone's life trajectory",    "tags": ["Teacher/Educator","Social Worker","Healthcare Administrator","Lawyer/Legal Analyst"]},
        ],
    },
]

# ── Career Roadmaps ───────────────────────────────────────────────────────

ROADMAPS = {
    "Software Engineer": {
        "icon": "💻", "color": "#38bdf8",
        "description": "Build the software that powers the modern world — from web apps to operating systems.",
        "phases": [
            {
                "phase": 1, "title": "Foundations", "duration": "0–6 months",
                "steps": [
                    "Learn Python or JavaScript fundamentals",
                    "Understand data structures & algorithms basics",
                    "Build 2–3 small projects (calculator, to-do app, weather app)",
                    "Learn Git & GitHub version control",
                    "Complete a free course: CS50, freeCodeCamp, or The Odin Project",
                ],
                "resources": ["cs50.harvard.edu", "freecodecamp.org", "theodinproject.com"],
            },
            {
                "phase": 2, "title": "Core Skills", "duration": "6–18 months",
                "steps": [
                    "Master one frontend framework (React) or backend (Django/Node.js)",
                    "Learn SQL databases and REST API design",
                    "Understand system design basics",
                    "Build a full-stack project and deploy it",
                    "Start contributing to open source",
                ],
                "resources": ["reactjs.org", "roadmap.sh/backend", "postgresql.org"],
            },
            {
                "phase": 3, "title": "Job Ready", "duration": "18–24 months",
                "steps": [
                    "Solve 100+ LeetCode problems (Easy → Medium)",
                    "Build a strong GitHub portfolio (3–5 projects)",
                    "Practice system design interviews",
                    "Apply to internships or junior roles",
                    "Network on LinkedIn and attend tech meetups",
                ],
                "resources": ["leetcode.com", "interviewing.io", "linkedin.com"],
            },
            {
                "phase": 4, "title": "Growth", "duration": "2–5 years",
                "steps": [
                    "Specialise: backend, frontend, mobile, or platform",
                    "Aim for senior engineer role",
                    "Mentor junior developers",
                    "Learn cloud platforms (AWS, GCP, or Azure)",
                    "Consider tech lead or staff engineer track",
                ],
                "resources": ["aws.amazon.com", "cloud.google.com", "staffeng.com"],
            },
        ],
        "key_skills": ["Python / JavaScript", "Data Structures", "React or Node.js", "SQL", "Git", "System Design"],
        "certifications": ["AWS Certified Developer", "Google Associate Cloud Engineer", "Meta Front-End Developer"],
        "avg_salary": "$110,000", "job_growth": "25%",
    },
    "Data Scientist": {
        "icon": "📊", "color": "#818cf8",
        "description": "Extract insights from data to drive business decisions and build intelligent systems.",
        "phases": [
            {
                "phase": 1, "title": "Foundations", "duration": "0–6 months",
                "steps": [
                    "Learn Python (NumPy, Pandas, Matplotlib)",
                    "Study statistics: mean, median, distributions, hypothesis testing",
                    "Complete Kaggle's free Python & Pandas courses",
                    "Work through a basic ML course (Andrew Ng on Coursera)",
                    "Explore your first dataset end-to-end",
                ],
                "resources": ["kaggle.com", "coursera.org/learn/machine-learning", "scipy.org"],
            },
            {
                "phase": 2, "title": "Core Skills", "duration": "6–18 months",
                "steps": [
                    "Master scikit-learn: regression, classification, clustering",
                    "Learn SQL for data extraction",
                    "Study deep learning basics (PyTorch or TensorFlow)",
                    "Build 3–5 end-to-end ML projects",
                    "Participate in Kaggle competitions",
                ],
                "resources": ["scikit-learn.org", "fast.ai", "kaggle.com/competitions"],
            },
            {
                "phase": 3, "title": "Job Ready", "duration": "18–24 months",
                "steps": [
                    "Build a portfolio: GitHub + Kaggle profile",
                    "Learn data visualisation (Tableau or Power BI)",
                    "Study A/B testing and experimentation",
                    "Practice SQL interview questions",
                    "Apply for data analyst → data scientist roles",
                ],
                "resources": ["tableau.com", "mode.com/sql-tutorial", "stratascratch.com"],
            },
            {
                "phase": 4, "title": "Growth", "duration": "2–5 years",
                "steps": [
                    "Specialise: NLP, computer vision, or forecasting",
                    "Learn MLOps and model deployment",
                    "Aim for senior or lead data scientist",
                    "Publish papers or blog posts on medium/arxiv",
                    "Build expertise in a specific domain (finance, health, etc.)",
                ],
                "resources": ["mlflow.org", "arxiv.org", "towardsdatascience.com"],
            },
        ],
        "key_skills": ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualisation", "Deep Learning"],
        "certifications": ["Google Professional Data Engineer", "IBM Data Science Certificate", "Databricks Certified Associate"],
        "avg_salary": "$120,000", "job_growth": "36%",
    },
    "Machine Learning Engineer": {
        "icon": "🤖", "color": "#34d399",
        "description": "Design, build, and deploy AI systems and machine learning models at production scale.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–6 months",
             "steps": ["Strong Python programming", "Linear algebra & calculus basics", "Probability & statistics", "Intro to ML with scikit-learn", "Complete fast.ai or Andrew Ng course"],
             "resources": ["fast.ai", "coursera.org", "khanacademy.org"]},
            {"phase": 2, "title": "Core Skills", "duration": "6–18 months",
             "steps": ["Master PyTorch or TensorFlow", "Deep learning: CNNs, RNNs, Transformers", "Build end-to-end ML pipelines", "Learn Docker and containerisation", "Study model evaluation and debugging"],
             "resources": ["pytorch.org", "tensorflow.org", "huggingface.co"]},
            {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
             "steps": ["Learn MLOps: MLflow, Kubeflow, or SageMaker", "Deploy a model as an API (FastAPI + Docker)", "Contribute to open source ML projects", "Build a portfolio with real datasets", "Prepare for ML system design interviews"],
             "resources": ["mlflow.org", "fastapi.tiangolo.com", "papers.nips.cc"]},
            {"phase": 4, "title": "Growth", "duration": "2–5 years",
             "steps": ["Specialise: NLP, vision, RL, or recommendation systems", "Lead ML infrastructure at a company", "Publish research or technical blog posts", "Aim for Staff ML Engineer or Research Scientist", "Explore LLM fine-tuning and deployment"],
             "resources": ["arxiv.org", "openai.com/research", "deepmind.com"]},
        ],
        "key_skills": ["Python", "PyTorch/TensorFlow", "MLOps", "Statistics", "System Design", "Cloud (AWS/GCP)"],
        "certifications": ["AWS ML Specialty", "Google Professional ML Engineer", "DeepLearning.AI TensorFlow Developer"],
        "avg_salary": "$130,000", "job_growth": "40%",
    },
    "UX/UI Designer": {
        "icon": "🎨", "color": "#fb923c",
        "description": "Craft intuitive, beautiful digital experiences that users love.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–6 months",
             "steps": ["Learn design principles: hierarchy, contrast, spacing", "Master Figma (free)", "Study UX basics: user research, personas, wireframing", "Complete Google UX Design Certificate", "Redesign 2–3 existing apps for practice"],
             "resources": ["figma.com", "coursera.org/google-ux", "nngroup.com"]},
            {"phase": 2, "title": "Core Skills", "duration": "6–18 months",
             "steps": ["Build a 3–5 case study portfolio", "Learn prototyping and user testing", "Study information architecture", "Learn basic HTML/CSS (understand dev handoff)", "Collaborate on real projects (freelance or volunteer)"],
             "resources": ["dribbble.com", "behance.net", "uxdesign.cc"]},
            {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
             "steps": ["Craft a compelling portfolio website", "Practice presenting design decisions", "Network with designers on LinkedIn/Dribbble", "Apply for junior UX/product designer roles", "Prepare for design critique interviews"],
             "resources": ["portfolio.adobe.com", "awwwards.com", "designinterview.com"]},
            {"phase": 4, "title": "Growth", "duration": "2–5 years",
             "steps": ["Specialise: product design, design systems, or UX research", "Lead design for a product team", "Build or contribute to a design system", "Mentor junior designers", "Aim for senior or principal designer"],
             "resources": ["designsystems.com", "material.io", "apple.com/design"]},
        ],
        "key_skills": ["Figma", "User Research", "Prototyping", "Design Systems", "HTML/CSS basics", "Usability Testing"],
        "certifications": ["Google UX Design Certificate", "Interaction Design Foundation", "Nielsen Norman UX Certification"],
        "avg_salary": "$85,000", "job_growth": "13%",
    },
    "Product Manager": {
        "icon": "📋", "color": "#38bdf8",
        "description": "Define what gets built, why, and for whom — the strategic voice between business, design, and engineering.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–6 months",
             "steps": ["Read: Inspired by Marty Cagan", "Learn product frameworks: OKRs, PRDs, roadmaps", "Study basic SQL for data analysis", "Take a free PM course (Product School, Coursera)", "Shadow or assist a PM at a company"],
             "resources": ["svpg.com", "productschool.com", "coursera.org"]},
            {"phase": 2, "title": "Core Skills", "duration": "6–18 months",
             "steps": ["Master user story writing and backlog management", "Learn Agile/Scrum methodology", "Study product metrics: DAU, retention, NPS", "Build intuition for user research", "Work on a side product or contribute to open source"],
             "resources": ["atlassian.com/agile", "amplitude.com", "mixpanel.com"]},
            {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
             "steps": ["Build a portfolio of product case studies", "Prepare for PM interviews: estimation, product design, strategy", "Network at product meetups and on LinkedIn", "Apply for APM (associate PM) or PM roles", "Practice mock interviews on Exponent"],
             "resources": ["tryexponent.com", "pminterview.io", "lenny.substack.com"]},
            {"phase": 4, "title": "Growth", "duration": "2–5 years",
             "steps": ["Own a product line end-to-end", "Develop leadership and stakeholder management skills", "Aim for Senior PM → Group PM → Director", "Build expertise in a specific domain (fintech, health, AI)", "Consider CPO track or entrepreneurship"],
             "resources": ["reforge.com", "stratechery.com", "lennysnewsletter.com"]},
        ],
        "key_skills": ["Product Strategy", "Agile/Scrum", "Data Analysis", "User Research", "Stakeholder Management", "SQL"],
        "certifications": ["Certified Scrum Product Owner", "Product School Certificate", "Pragmatic Marketing Certification"],
        "avg_salary": "$115,000", "job_growth": "10%",
    },
    "Cybersecurity Analyst": {
        "icon": "🔐", "color": "#f87171",
        "description": "Protect systems, networks, and data from digital attacks and breaches.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–6 months",
             "steps": ["Learn networking fundamentals (TCP/IP, DNS, HTTP)", "Study Linux command line basics", "Complete CompTIA IT Fundamentals+", "Set up a home lab with VirtualBox/Kali Linux", "Learn basic Python scripting"],
             "resources": ["tryhackme.com", "comptia.org", "linux.org"]},
            {"phase": 2, "title": "Core Skills", "duration": "6–18 months",
             "steps": ["Earn CompTIA Security+ certification", "Practice on TryHackMe and HackTheBox", "Learn SIEM tools (Splunk, ELK)", "Study common attacks: SQL injection, XSS, phishing", "Understand firewalls and IDS/IPS"],
             "resources": ["hackthebox.com", "tryhackme.com", "splunk.com"]},
            {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
             "steps": ["Earn CEH or CompTIA CySA+", "Build a security lab portfolio", "Document CTF (Capture The Flag) write-ups", "Network at DEF CON, Black Hat, BSides events", "Apply for SOC Analyst or Security Analyst roles"],
             "resources": ["defcon.org", "ctftime.org", "sans.org"]},
            {"phase": 4, "title": "Growth", "duration": "2–5 years",
             "steps": ["Specialise: pentesting, cloud security, or incident response", "Earn OSCP (offensive) or CISSP (leadership)", "Lead security operations or red team", "Contribute to CVE disclosures or bug bounties", "Aim for Security Engineer or CISO track"],
             "resources": ["offensive-security.com", "bugcrowd.com", "isc2.org"]},
        ],
        "key_skills": ["Networking", "Linux", "Python", "SIEM Tools", "Penetration Testing", "Incident Response"],
        "certifications": ["CompTIA Security+", "CEH", "OSCP", "CISSP"],
        "avg_salary": "$103,000", "job_growth": "35%",
    },
    "Financial Analyst": {
        "icon": "💰", "color": "#34d399",
        "description": "Drive financial strategy, investment decisions, and business growth through data-driven analysis.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–6 months",
             "steps": ["Learn Excel and financial modelling basics", "Study accounting fundamentals", "Take a free finance course (Coursera / edX)", "Read: The Intelligent Investor by Benjamin Graham", "Learn SQL for data querying"],
             "resources": ["coursera.org/finance", "investopedia.com", "wallstreetoasis.com"]},
            {"phase": 2, "title": "Core Skills", "duration": "6–18 months",
             "steps": ["Master DCF valuation and financial statement analysis", "Learn Python for finance (pandas, yfinance)", "Study Bloomberg Terminal or FactSet basics", "Build financial models from scratch", "Complete CFA Level 1 prep"],
             "resources": ["cfainstitute.org", "wallstreetprep.com", "corporatefinanceinstitute.com"]},
            {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
             "steps": ["Earn CFA Level 1", "Build an investment or financial modelling portfolio", "Network with analysts on LinkedIn", "Apply for junior analyst or FP&A roles", "Practice case study interviews"],
             "resources": ["mergersandinquisitions.com", "breakingintowallstreet.com", "linkedin.com"]},
            {"phase": 4, "title": "Growth", "duration": "2–5 years",
             "steps": ["Complete CFA Level 2 & 3", "Specialise: investment banking, PE, or corporate finance", "Develop client relationships and deal experience", "Aim for Senior Analyst → VP → Director", "Consider MBA at top business school"],
             "resources": ["cfainstitute.org", "gmat.com", "bloomberg.com"]},
        ],
        "key_skills": ["Excel", "Financial Modelling", "SQL", "Python", "Valuation", "Bloomberg"],
        "certifications": ["CFA (Chartered Financial Analyst)", "CPA", "Financial Modelling & Valuation Analyst (FMVA)"],
        "avg_salary": "$83,000", "job_growth": "9%",
    },
    "Graphic Designer": {
        "icon": "🖌️", "color": "#fb923c",
        "description": "Communicate ideas visually — from brand identities to motion graphics and digital campaigns.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–6 months",
             "steps": ["Learn design principles: colour theory, typography, layout", "Master Adobe Illustrator & Photoshop (or free Canva/GIMP)", "Study logo design and branding basics", "Complete a free design course on YouTube", "Recreate 10 famous logos for practice"],
             "resources": ["canva.com/design-school", "adobe.com", "youtube.com/c/TutorialsByA"]},
            {"phase": 2, "title": "Core Skills", "duration": "6–18 months",
             "steps": ["Build a 10-piece portfolio", "Learn print design vs digital design differences", "Explore motion graphics (After Effects basics)", "Take on freelance projects (Fiverr, Upwork)", "Study brand identity design"],
             "resources": ["behance.net", "99designs.com", "skillshare.com"]},
            {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
             "steps": ["Build a professional portfolio website", "Specialise: branding, UI, or motion graphics", "Network on Dribbble and Behance", "Apply for junior designer or creative agency roles", "Build a strong social media presence for design work"],
             "resources": ["dribbble.com", "awwwards.com", "fonts.google.com"]},
            {"phase": 4, "title": "Growth", "duration": "2–5 years",
             "steps": ["Lead branding or design projects", "Develop Art Director skills", "Build long-term client relationships", "Teach or mentor aspiring designers", "Aim for Senior Designer or Creative Director"],
             "resources": ["aiga.org", "creativeboom.com", "designweek.co.uk"]},
        ],
        "key_skills": ["Adobe Suite", "Typography", "Colour Theory", "Branding", "Layout Design", "Motion Graphics"],
        "certifications": ["Adobe Certified Professional", "Canva Design Certificate", "AIGA Membership"],
        "avg_salary": "$55,000", "job_growth": "3%",
    },
    "Digital Marketer": {
        "icon": "📣", "color": "#818cf8",
        "description": "Grow brands and businesses through data-driven digital campaigns across all online channels.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–6 months",
             "steps": ["Learn SEO basics and Google Search Console", "Study Google Analytics and conversion tracking", "Complete Google Digital Marketing Certificate", "Learn social media marketing fundamentals", "Create and grow a personal brand online"],
             "resources": ["google.com/digital-garage", "moz.com/beginners-guide-to-seo", "hubspot.com/free-courses"]},
            {"phase": 2, "title": "Core Skills", "duration": "6–18 months",
             "steps": ["Master Google Ads and Meta Ads Manager", "Learn email marketing (Mailchimp, Klaviyo)", "Study content marketing and copywriting", "Build and analyse your first real campaign", "Learn A/B testing and CRO"],
             "resources": ["semrush.com/academy", "copyhackers.com", "cxl.com"]},
            {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
             "steps": ["Earn Google Ads and Analytics certifications", "Build a portfolio of campaign results (real numbers)", "Specialise: SEO, paid social, email, or content", "Network at marketing events and online communities", "Apply for digital marketing or growth roles"],
             "resources": ["skillshop.withgoogle.com", "marketingweek.com", "growthmarketers.co"]},
            {"phase": 4, "title": "Growth", "duration": "2–5 years",
             "steps": ["Own a full marketing channel or budget", "Learn marketing analytics and attribution", "Develop team leadership skills", "Aim for Marketing Manager → Head of Marketing", "Consider entrepreneurship or agency ownership"],
             "resources": ["reforge.com", "marketingland.com", "adworld.ie"]},
        ],
        "key_skills": ["SEO", "Google Ads", "Analytics", "Content Strategy", "Email Marketing", "Social Media"],
        "certifications": ["Google Ads Certification", "HubSpot Inbound Marketing", "Meta Blueprint"],
        "avg_salary": "$65,000", "job_growth": "10%",
    },
    "Teacher/Educator": {
        "icon": "📚", "color": "#34d399",
        "description": "Shape the next generation through inspiring teaching, mentorship, and curriculum design.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–12 months",
             "steps": ["Complete a Bachelor's degree (any subject + education minor)", "Volunteer at schools or tutoring centres", "Study pedagogy and child development basics", "Learn classroom management techniques", "Get first aid and safeguarding certified"],
             "resources": ["khanacademy.org", "teacherspayteachers.com", "edutopia.org"]},
            {"phase": 2, "title": "Qualification", "duration": "1–3 years",
             "steps": ["Complete teacher certification or B.Ed.", "Student teaching placement (practicum)", "Learn to design engaging lesson plans", "Study assessment and differentiated instruction", "Build a teaching portfolio"],
             "resources": ["teach.gov", "tes.com", "edx.org/education"]},
            {"phase": 3, "title": "First Role", "duration": "3–5 years",
             "steps": ["Apply for teaching positions", "Join a mentoring programme for new teachers", "Attend professional development workshops", "Build relationships with students and parents", "Earn tenure in your school or district"],
             "resources": ["indeed.com", "teachers.net", "nea.org"]},
            {"phase": 4, "title": "Growth", "duration": "5+ years",
             "steps": ["Pursue a Master's in Education", "Specialise: STEM, Special Ed, or curriculum design", "Move into department head or school leadership", "Explore EdTech or online course creation", "Aim for Principal or Education Director"],
             "resources": ["coursera.org/education", "udemy.com", "iste.org"]},
        ],
        "key_skills": ["Lesson Planning", "Communication", "Classroom Management", "Assessment", "Curriculum Design", "Empathy"],
        "certifications": ["State Teaching Certification", "TESOL/TEFL", "Google Certified Educator"],
        "avg_salary": "$60,000", "job_growth": "5%",
    },
    "Social Worker": {
        "icon": "🤝", "color": "#fb923c",
        "description": "Empower vulnerable individuals and communities through direct support and systemic advocacy.",
        "phases": [
            {"phase": 1, "title": "Foundations", "duration": "0–12 months",
             "steps": ["Volunteer at community organisations or shelters", "Study psychology and sociology fundamentals", "Learn about mental health conditions and trauma", "Complete a First Aid + Mental Health First Aid course", "Begin a BSW (Bachelor of Social Work)"],
             "resources": ["socialwork.org", "nasw.org", "mentalhealth.gov"]},
            {"phase": 2, "title": "Degree & Training", "duration": "1–4 years",
             "steps": ["Complete BSW degree with field placement", "Learn motivational interviewing techniques", "Study child protection and family systems", "Take electives in mental health or substance abuse", "Secure supervised clinical hours"],
             "resources": ["naswpress.org", "socialworktoday.com", "coursera.org/social-work"]},
            {"phase": 3, "title": "First Role", "duration": "4–6 years",
             "steps": ["Get licensed: LSW or LCSW (USA) or equivalent", "Apply for case manager or counsellor roles", "Develop a caseload management system", "Build rapport and trust with clients", "Pursue clinical supervision hours"],
             "resources": ["aswb.org", "indeed.com/social-work", "socialworklicensemap.com"]},
            {"phase": 4, "title": "Growth", "duration": "5+ years",
             "steps": ["Earn MSW (Master of Social Work)", "Specialise: clinical, policy, or school social work", "Pursue LCSW for independent practice", "Lead a department or non-profit programme", "Advocate for policy change at systemic level"],
             "resources": ["cswe.org", "nasw.org", "nytimes.com/social-issues"]},
        ],
        "key_skills": ["Empathy", "Case Management", "Crisis Intervention", "Communication", "Advocacy", "Documentation"],
        "certifications": ["LSW / LCSW License", "Certified Case Manager (CCM)", "Mental Health First Aid"],
        "avg_salary": "$50,000", "job_growth": "12%",
    },
}

# Fallback roadmap for careers without a custom one
DEFAULT_ROADMAP_TEMPLATE = {
    "phases": [
        {"phase": 1, "title": "Foundations", "duration": "0–6 months",
         "steps": ["Research the field deeply", "Take an introductory online course", "Connect with professionals in the field", "Build foundational skills", "Define your specific niche within this career"],
         "resources": ["coursera.org", "linkedin.com/learning", "youtube.com"]},
        {"phase": 2, "title": "Skill Building", "duration": "6–18 months",
         "steps": ["Complete a structured training programme", "Work on real projects", "Build a portfolio or evidence of your skills", "Network with professionals", "Seek mentorship"],
         "resources": ["udemy.com", "edx.org", "meetup.com"]},
        {"phase": 3, "title": "Job Ready", "duration": "18–24 months",
         "steps": ["Polish your CV and portfolio", "Apply for entry-level roles", "Prepare for interviews", "Expand your professional network", "Consider relevant certifications"],
         "resources": ["linkedin.com", "indeed.com", "glassdoor.com"]},
        {"phase": 4, "title": "Growth", "duration": "2–5 years",
         "steps": ["Specialise in a sub-area", "Take on leadership responsibilities", "Mentor others", "Continuously upskill", "Set 5-year career goals"],
         "resources": ["harvard.edu/online", "coursera.org", "reforge.com"]},
    ],
}


def get_roadmap(career: str) -> dict:
    if career in ROADMAPS:
        return ROADMAPS[career]
    # Build a basic one for unlisted careers
    from ml.model import CAREER_META
    meta = CAREER_META.get(career, {})
    return {
        "icon": meta.get("icon", "💼"),
        "color": "#38bdf8",
        "description": f"A rewarding career in {career}.",
        "avg_salary": meta.get("avg_salary", "N/A"),
        "job_growth": meta.get("growth", "N/A"),
        "key_skills": [],
        "certifications": [],
        **DEFAULT_ROADMAP_TEMPLATE,
    }


# ── Routes ────────────────────────────────────────────────────────────────

@quiz_bp.route("/questions", methods=["GET"])
def get_questions():
    """Return all 20 quiz questions (no auth needed to view)."""
    return jsonify({"questions": QUESTIONS, "total": len(QUESTIONS)}), 200


@quiz_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_quiz():
    """
    Body: { "answers": [{ "question_id": 1, "option_index": 0 }, ...] }
    Returns: top career matches + full roadmap for #1
    """
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    answers = data.get("answers", [])

    if len(answers) < 10:
        return jsonify({"error": "Please answer at least 10 questions"}), 400

    # ── Score careers from answers ────────────────────────────────────
    career_scores: dict[str, float] = {}

    for answer in answers:
        qid    = answer.get("question_id")
        opt_i  = answer.get("option_index")
        q = next((q for q in QUESTIONS if q["id"] == qid), None)
        if not q or opt_i is None or opt_i >= len(q["options"]):
            continue
        tags = q["options"][opt_i]["tags"]
        for tag in tags:
            career_scores[tag] = career_scores.get(tag, 0) + 1

    # Normalise scores
    max_score = max(career_scores.values()) if career_scores else 1
    ranked = sorted(career_scores.items(), key=lambda x: x[1], reverse=True)

    # Top 5 careers with normalised match %
    top5 = []
    for i, (career, score) in enumerate(ranked[:5]):
        from ml.model import CAREER_META, enrich_recommendations
        meta = CAREER_META.get(career, {})
        top5.append({
            "rank":        i + 1,
            "career":      career,
            "score":       round(score / max_score, 4),
            "icon":        meta.get("icon", "💼"),
            "avg_salary":  meta.get("avg_salary", "N/A"),
            "growth":      meta.get("growth", "N/A"),
            "category":    meta.get("category", "Career"),
        })

    # ── Full roadmap for #1 career ────────────────────────────────────
    top_career = top5[0]["career"] if top5 else "Software Engineer"
    roadmap    = get_roadmap(top_career)

    # ── Persist to DB ─────────────────────────────────────────────────
    db = get_db()
    snapshot = {
        "type":      "quiz",
        "timestamp": datetime.utcnow().isoformat(),
        "answers":   answers,
        "results":   top5,
        "roadmap_for": top_career,
    }
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"recommendation_history": {"$each": [snapshot], "$slice": -20}}}
    )
    db.activity_logs.insert_one(
        new_activity_log(user_id, "quiz_submit", {"top_career": top_career})
    )

    return jsonify({
        "top_careers": top5,
        "roadmap":     roadmap,
        "roadmap_for": top_career,
    }), 200


@quiz_bp.route("/roadmap/<path:career_name>", methods=["GET"])
@jwt_required()
def get_career_roadmap(career_name):
    """Get roadmap for any specific career by name."""
    roadmap = get_roadmap(career_name)
    return jsonify({"career": career_name, "roadmap": roadmap}), 200
