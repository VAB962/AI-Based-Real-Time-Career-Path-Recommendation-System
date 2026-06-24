"""
ml/dataset.py — Synthetic career dataset (5 000+ samples)
"""
import pandas as pd
import numpy as np
import random

CAREERS = [
    "Software Engineer","Data Scientist","UX/UI Designer","Product Manager",
    "Cybersecurity Analyst","DevOps Engineer","Machine Learning Engineer",
    "Business Analyst","Financial Analyst","Digital Marketer",
    "Healthcare Administrator","Biomedical Researcher","Graphic Designer",
    "Content Writer","Environmental Scientist","Teacher/Educator",
    "Mechanical Engineer","Electrical Engineer","Lawyer/Legal Analyst",
    "Social Worker",
]

# Career → typical skill weights (higher = more likely to appear)
CAREER_SKILL_PROFILES = {
    "Software Engineer":          ["Python","JavaScript","Java","C++","SQL","React","Node.js","DevOps"],
    "Data Scientist":             ["Python","Machine Learning","Statistics","SQL","Data Analysis","Deep Learning","R"],
    "UX/UI Designer":             ["UX/UI","Graphic Design","Creativity","Communication","JavaScript","React"],
    "Product Manager":            ["Project Management","Communication","Leadership","Data Analysis","Marketing","Problem Solving"],
    "Cybersecurity Analyst":      ["Cybersecurity","Python","Networking","Problem Solving","C++","Linux"],
    "DevOps Engineer":            ["DevOps","Cloud Computing","Python","Docker","Kubernetes","Linux","Shell Scripting"],
    "Machine Learning Engineer":  ["Machine Learning","Python","Deep Learning","Statistics","TensorFlow","Data Analysis"],
    "Business Analyst":           ["SQL","Data Analysis","Communication","Project Management","Excel","Statistics"],
    "Financial Analyst":          ["Finance","Accounting","SQL","Statistics","Excel","Problem Solving"],
    "Digital Marketer":           ["Marketing","Communication","Creativity","SEO","Social Media","Analytics"],
    "Healthcare Administrator":   ["Healthcare","Leadership","Communication","Project Management","Finance"],
    "Biomedical Researcher":      ["Biology","Chemistry","Research","Statistics","Python","Data Analysis"],
    "Graphic Designer":           ["Graphic Design","Creativity","UX/UI","Adobe Suite","Communication"],
    "Content Writer":             ["Writing","Research","Communication","Creativity","SEO","Marketing"],
    "Environmental Scientist":    ["Biology","Chemistry","Research","Statistics","Environmental Science","GIS"],
    "Teacher/Educator":           ["Teaching","Communication","Creativity","Research","Leadership","Problem Solving"],
    "Mechanical Engineer":        ["Physics","C++","CAD","Problem Solving","Mathematics","Project Management"],
    "Electrical Engineer":        ["Physics","C++","Electronics","Mathematics","MATLAB","Problem Solving"],
    "Lawyer/Legal Analyst":       ["Writing","Research","Communication","Critical Thinking","Problem Solving","Law"],
    "Social Worker":              ["Communication","Social Work","Leadership","Teamwork","Problem Solving","Healthcare"],
}

CAREER_INTEREST_PROFILES = {
    "Software Engineer":          ["Technology","Gaming","Engineering","Science"],
    "Data Scientist":             ["Technology","Science","Research","Finance"],
    "UX/UI Designer":             ["Art & Design","Technology","Media","Fashion"],
    "Product Manager":            ["Technology","Business","Entrepreneurship","Finance"],
    "Cybersecurity Analyst":      ["Technology","Science","Law","Engineering"],
    "DevOps Engineer":            ["Technology","Engineering","Science","Gaming"],
    "Machine Learning Engineer":  ["Technology","Science","Research","Engineering"],
    "Business Analyst":           ["Business","Finance","Technology","Research"],
    "Financial Analyst":          ["Finance","Business","Research","Technology"],
    "Digital Marketer":           ["Marketing","Media","Business","Art & Design"],
    "Healthcare Administrator":   ["Healthcare","Business","Education","Law"],
    "Biomedical Researcher":      ["Science","Healthcare","Research","Environment"],
    "Graphic Designer":           ["Art & Design","Media","Technology","Fashion"],
    "Content Writer":             ["Media","Art & Design","Education","Travel"],
    "Environmental Scientist":    ["Environment","Science","Research","Travel"],
    "Teacher/Educator":           ["Education","Social Work","Art & Design","Science"],
    "Mechanical Engineer":        ["Engineering","Technology","Science","Sports"],
    "Electrical Engineer":        ["Engineering","Technology","Science","Gaming"],
    "Lawyer/Legal Analyst":       ["Law","Politics","Business","Research"],
    "Social Worker":              ["Social Work","Education","Healthcare","Politics"],
}

CAREER_EDUCATION = {
    "Software Engineer":          ["Bachelor's","Master's","Bootcamp","Self-taught"],
    "Data Scientist":             ["Master's","PhD","Bachelor's"],
    "UX/UI Designer":             ["Bachelor's","Bootcamp","Self-taught","Associate's"],
    "Product Manager":            ["Bachelor's","Master's"],
    "Cybersecurity Analyst":      ["Bachelor's","Bootcamp","Master's"],
    "DevOps Engineer":            ["Bachelor's","Bootcamp","Self-taught"],
    "Machine Learning Engineer":  ["Master's","PhD","Bachelor's"],
    "Business Analyst":           ["Bachelor's","Master's"],
    "Financial Analyst":          ["Bachelor's","Master's"],
    "Digital Marketer":           ["Bachelor's","Self-taught","Bootcamp","Associate's"],
    "Healthcare Administrator":   ["Bachelor's","Master's"],
    "Biomedical Researcher":      ["Master's","PhD","Bachelor's"],
    "Graphic Designer":           ["Bachelor's","Associate's","Self-taught","Bootcamp"],
    "Content Writer":             ["Bachelor's","Self-taught","Associate's"],
    "Environmental Scientist":    ["Bachelor's","Master's","PhD"],
    "Teacher/Educator":           ["Bachelor's","Master's"],
    "Mechanical Engineer":        ["Bachelor's","Master's"],
    "Electrical Engineer":        ["Bachelor's","Master's"],
    "Lawyer/Legal Analyst":       ["Bachelor's","Master's"],
    "Social Worker":              ["Bachelor's","Master's"],
}

ALL_SKILLS = [
    "Python","JavaScript","Java","C++","C#","Go","Rust","TypeScript",
    "SQL","NoSQL","React","Angular","Vue","Node.js","Django","Flask",
    "Machine Learning","Deep Learning","Data Analysis","Statistics",
    "Communication","Leadership","Project Management","Problem Solving",
    "Teamwork","Creativity","Critical Thinking","Marketing","Sales",
    "Graphic Design","UX/UI","Accounting","Finance","Biology","Chemistry",
    "Physics","Writing","Research","Teaching","Healthcare","Cybersecurity",
    "Cloud Computing","DevOps","Blockchain","Mobile Development",
    "Linux","Shell Scripting","Docker","Kubernetes","TensorFlow",
    "Excel","SEO","Social Media","Analytics","Adobe Suite","CAD","MATLAB",
    "GIS","R","Electronics","Mathematics","Environmental Science","Law",
    "Social Work","Networking",
]

ALL_INTERESTS = [
    "Technology","Science","Art & Design","Business","Healthcare","Education",
    "Finance","Music","Gaming","Sports","Travel","Environment","Law","Media",
    "Engineering","Research","Entrepreneurship","Social Work","Politics","Fashion",
]

EDUCATION_LEVELS = ["High School","Associate's","Bachelor's","Master's","PhD","Bootcamp","Self-taught"]


def generate_sample(career: str, seed: int) -> dict:
    rng = random.Random(seed)

    # Skills: pick 3-7 from career profile + 0-3 random
    core = CAREER_SKILL_PROFILES.get(career, ALL_SKILLS[:5])
    n_core = rng.randint(3, min(7, len(core)))
    chosen_skills = rng.sample(core, n_core)
    n_extra = rng.randint(0, 3)
    extras = [s for s in ALL_SKILLS if s not in chosen_skills]
    chosen_skills += rng.sample(extras, min(n_extra, len(extras)))

    # Interests: 2-4 from career profile + 0-2 random
    core_int = CAREER_INTEREST_PROFILES.get(career, ALL_INTERESTS[:3])
    n_core_int = rng.randint(2, min(4, len(core_int)))
    chosen_interests = rng.sample(core_int, n_core_int)
    n_extra_int = rng.randint(0, 2)
    ext_int = [i for i in ALL_INTERESTS if i not in chosen_interests]
    chosen_interests += rng.sample(ext_int, min(n_extra_int, len(ext_int)))

    education = rng.choice(CAREER_EDUCATION.get(career, EDUCATION_LEVELS))
    experience = max(0, int(rng.gauss(4, 3)))

    return {
        "skills": chosen_skills,
        "interests": chosen_interests,
        "education": education,
        "years_of_experience": experience,
        "career": career,
    }


def generate_dataset(n_samples: int = 5000) -> pd.DataFrame:
    rows = []
    per_career = n_samples // len(CAREERS)
    seed = 42
    for career in CAREERS:
        for i in range(per_career):
            rows.append(generate_sample(career, seed))
            seed += 1
    # top up to exact n
    while len(rows) < n_samples:
        rows.append(generate_sample(random.choice(CAREERS), seed))
        seed += 1
    return pd.DataFrame(rows[:n_samples])


if __name__ == "__main__":
    df = generate_dataset(5000)
    print(df.shape)
    print(df["career"].value_counts())
