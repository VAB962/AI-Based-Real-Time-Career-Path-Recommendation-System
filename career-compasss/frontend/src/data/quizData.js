export const QUIZ_QUESTIONS = [
  { id:1,  category:"Work Style",   question:"When solving a problem, you prefer to:", options:[{label:"Analyse data and find patterns",scores:{data:3,ml:2,finance:2}},{label:"Build or create something tangible",scores:{software:3,devops:2,mechanical:2}},{label:"Talk it through with people",scores:{manager:3,marketing:2,social:2}},{label:"Research and read about it deeply",scores:{researcher:3,writer:2,legal:2}}]},
  { id:2,  category:"Environment",  question:"Your ideal work environment is:", options:[{label:"A quiet desk with code and screens",scores:{software:3,cybersecurity:2,devops:2}},{label:"A creative studio with design tools",scores:{designer:3,ux:3,writer:1}},{label:"A hospital, lab or care setting",scores:{healthcare:3,researcher:2}},{label:"An office with meetings and strategy",scores:{manager:3,finance:2,marketing:2}}]},
  { id:3,  category:"Motivation",   question:"What motivates you most at work?", options:[{label:"Solving hard technical challenges",scores:{software:2,ml:3,cybersecurity:2}},{label:"Helping and supporting other people",scores:{social:3,healthcare:3,teacher:2}},{label:"Earning recognition and leading teams",scores:{manager:3,marketing:2,legal:1}},{label:"Making creative things people enjoy",scores:{designer:3,ux:2,writer:2}}]},
  { id:4,  category:"Skills",       question:"Which activity do you enjoy most?", options:[{label:"Writing code or automating things",scores:{software:3,devops:3,ml:2}},{label:"Drawing, designing or making visuals",scores:{designer:3,ux:3}},{label:"Analysing numbers and spreadsheets",scores:{data:3,finance:3,researcher:1}},{label:"Persuading or presenting to people",scores:{marketing:3,manager:2,legal:2}}]},
  { id:5,  category:"Impact",       question:"The kind of impact you want to have:", options:[{label:"Build products millions of people use",scores:{software:3,manager:2,ux:2}},{label:"Advance science or human knowledge",scores:{researcher:3,ml:2,data:1}},{label:"Protect people or fight injustice",scores:{cybersecurity:2,legal:3,social:2}},{label:"Improve health and wellbeing",scores:{healthcare:3,researcher:2,social:1}}]},
  { id:6,  category:"Subjects",     question:"Which school subject did you enjoy most?", options:[{label:"Math or Physics",scores:{software:2,data:2,mechanical:3,finance:2}},{label:"Biology or Chemistry",scores:{healthcare:3,researcher:3}},{label:"Art or Design",scores:{designer:3,ux:3,writer:1}},{label:"English or Social Studies",scores:{writer:3,legal:2,social:2,teacher:2}}]},
  { id:7,  category:"Teamwork",     question:"In a team project, you naturally take the role of:", options:[{label:"The technical lead who builds things",scores:{software:3,devops:2,mechanical:2}},{label:"The organiser who plans everything",scores:{manager:3,devops:1}},{label:"The creative who designs the vision",scores:{designer:3,ux:2,marketing:2}},{label:"The researcher who gathers insights",scores:{data:3,researcher:3,legal:1}}]},
  { id:8,  category:"Technology",   question:"Your relationship with technology:", options:[{label:"I love building and programming things",scores:{software:3,ml:3,devops:2}},{label:"I use it creatively for design/media",scores:{designer:3,ux:2,writer:1}},{label:"I use it as a tool, not my focus",scores:{manager:2,finance:2,social:1}},{label:"I want to understand how it all works",scores:{cybersecurity:3,devops:2,data:2}}]},
  { id:9,  category:"Values",       question:"What do you value most in a career?", options:[{label:"High salary and financial growth",scores:{finance:3,software:2,legal:2}},{label:"Making a difference in society",scores:{social:3,healthcare:2,teacher:2}},{label:"Creative freedom and expression",scores:{designer:3,writer:3,ux:2}},{label:"Intellectual challenge and growth",scores:{ml:3,researcher:3,data:2}}]},
  { id:10, category:"Daily Tasks",  question:"Your ideal day at work involves:", options:[{label:"Writing code and shipping features",scores:{software:3,devops:2}},{label:"Meetings, strategy and decisions",scores:{manager:3,marketing:2,finance:1}},{label:"Experiments, research and discovery",scores:{researcher:3,ml:2,data:2}},{label:"Helping clients or vulnerable people",scores:{social:3,healthcare:2,legal:1}}]},
  { id:11, category:"Problem Type", question:"The type of problem you love solving:", options:[{label:"Why is this system broken?",scores:{software:3,cybersecurity:2,devops:2}},{label:"What does this data tell us?",scores:{data:3,ml:3,finance:2}},{label:"How do we make this look/feel better?",scores:{ux:3,designer:3}},{label:"How can we help this person?",scores:{social:3,healthcare:2,teacher:2}}]},
  { id:12, category:"Learning",     question:"How do you prefer to learn new things?", options:[{label:"Build projects and learn by doing",scores:{software:3,devops:2,designer:2}},{label:"Read books, papers and deep research",scores:{researcher:3,legal:2,writer:2}},{label:"Watch structured courses",scores:{data:2,ml:2,finance:2}},{label:"Learn from mentors and people",scores:{manager:2,social:2,teacher:3}}]},
  { id:13, category:"Risk",         question:"Your attitude toward risk:", options:[{label:"I love experimenting with new ideas",scores:{ml:3,software:2,marketing:2}},{label:"I prefer calculated, data-backed risks",scores:{finance:3,data:3,manager:1}},{label:"I avoid risk and value stability",scores:{healthcare:2,teacher:2,legal:2}},{label:"I take creative risks for better output",scores:{designer:3,ux:2,writer:2}}]},
  { id:14, category:"Communication",question:"Your communication strength is:", options:[{label:"Writing clearly and persuasively",scores:{writer:3,legal:3,marketing:2}},{label:"Explaining complex ideas simply",scores:{teacher:3,manager:2,data:1}},{label:"Visual storytelling and presentation",scores:{designer:2,ux:2,marketing:3}},{label:"Listening and understanding others",scores:{social:3,healthcare:2,manager:2}}]},
  { id:15, category:"Industry",     question:"Which industry excites you most?", options:[{label:"Tech / AI / Software",scores:{software:3,ml:3,data:2}},{label:"Healthcare / Medicine / Biology",scores:{healthcare:3,researcher:3}},{label:"Finance / Banking / Investment",scores:{finance:3,data:2}},{label:"Media / Design / Entertainment",scores:{designer:3,writer:3,marketing:2}}]},
  { id:16, category:"Work Style",   question:"You do your best work when:", options:[{label:"Working independently on deep problems",scores:{software:2,researcher:3,writer:2}},{label:"Leading and motivating a team",scores:{manager:3,teacher:2}},{label:"Collaborating with a close-knit crew",scores:{devops:2,ux:2,social:2}},{label:"Competing against tough challenges",scores:{cybersecurity:3,finance:2,legal:2}}]},
  { id:17, category:"Future Vision",question:"In 10 years, you see yourself as:", options:[{label:"A senior engineer or tech architect",scores:{software:3,devops:3,ml:2}},{label:"A founder, director or executive",scores:{manager:3,marketing:2,finance:2}},{label:"A respected expert in your field",scores:{researcher:3,legal:3,data:2}},{label:"Someone who changed lives for the better",scores:{social:3,healthcare:3,teacher:3}}]},
  { id:18, category:"Tools",        question:"Which tools excite you most?", options:[{label:"Code editors, terminals, cloud",scores:{software:3,devops:3,cybersecurity:2}},{label:"Figma, Photoshop, design systems",scores:{designer:3,ux:3}},{label:"Excel, Tableau, Python for analysis",scores:{data:3,finance:3,ml:2}},{label:"Words, cameras, microphones, stages",scores:{writer:3,marketing:3,teacher:2}}]},
  { id:19, category:"Challenge",    question:"The hardest part of your dream job should be:", options:[{label:"Keeping up with fast-changing tech",scores:{software:2,ml:3,cybersecurity:2}},{label:"Navigating complex human relationships",scores:{manager:3,social:3,legal:2}},{label:"Creating truly original work",scores:{designer:3,writer:3,researcher:2}},{label:"Making high-stakes decisions",scores:{healthcare:3,legal:2,cybersecurity:2}}]},
  { id:20, category:"Superpower",   question:"Your greatest natural superpower is:", options:[{label:"Logical thinking and pattern recognition",scores:{data:3,ml:3,software:2}},{label:"Empathy and connecting with people",scores:{social:3,healthcare:2,teacher:3}},{label:"Creativity and aesthetic sense",scores:{designer:3,ux:3,writer:2}},{label:"Strategic thinking and persuasion",scores:{manager:3,marketing:3,legal:2}}]},
];

export const CAREER_KEY_MAP = {
  software:"Software Engineer", data:"Data Scientist", ml:"Machine Learning Engineer",
  ux:"UX/UI Designer", designer:"Graphic Designer", manager:"Product Manager",
  cybersecurity:"Cybersecurity Analyst", devops:"DevOps Engineer", finance:"Financial Analyst",
  marketing:"Digital Marketer", healthcare:"Healthcare Administrator", researcher:"Biomedical Researcher",
  writer:"Content Writer", legal:"Lawyer/Legal Analyst", social:"Social Worker",
  teacher:"Teacher/Educator", mechanical:"Mechanical Engineer",
};

const CAREER_META = {
  "Software Engineer":         {icon:"💻",avg_salary:"$110,000",growth:"25%",category:"Technology"},
  "Data Scientist":            {icon:"📊",avg_salary:"$120,000",growth:"36%",category:"Technology"},
  "Machine Learning Engineer": {icon:"🤖",avg_salary:"$130,000",growth:"40%",category:"Technology"},
  "UX/UI Designer":            {icon:"🎨",avg_salary:"$85,000", growth:"13%",category:"Design"},
  "Graphic Designer":          {icon:"🖌️",avg_salary:"$55,000", growth:"3%", category:"Design"},
  "Product Manager":           {icon:"📋",avg_salary:"$115,000",growth:"10%",category:"Business"},
  "Cybersecurity Analyst":     {icon:"🔐",avg_salary:"$103,000",growth:"35%",category:"Technology"},
  "DevOps Engineer":           {icon:"⚙️",avg_salary:"$118,000",growth:"22%",category:"Technology"},
  "Financial Analyst":         {icon:"💰",avg_salary:"$83,000", growth:"9%", category:"Finance"},
  "Digital Marketer":          {icon:"📣",avg_salary:"$65,000", growth:"10%",category:"Marketing"},
  "Healthcare Administrator":  {icon:"🏥",avg_salary:"$98,000", growth:"28%",category:"Healthcare"},
  "Biomedical Researcher":     {icon:"🔬",avg_salary:"$92,000", growth:"17%",category:"Science"},
  "Content Writer":            {icon:"✍️",avg_salary:"$50,000", growth:"9%", category:"Media"},
  "Lawyer/Legal Analyst":      {icon:"⚖️",avg_salary:"$120,000",growth:"10%",category:"Law"},
  "Social Worker":             {icon:"🤝",avg_salary:"$50,000", growth:"12%",category:"Social"},
  "Teacher/Educator":          {icon:"📚",avg_salary:"$60,000", growth:"5%", category:"Education"},
  "Mechanical Engineer":       {icon:"🔧",avg_salary:"$90,000", growth:"7%", category:"Engineering"},
};

export function scoreQuiz(answers) {
  const totals = {};
  answers.forEach((optionIndex, questionIndex) => {
    const q = QUIZ_QUESTIONS[questionIndex];
    if (!q) return;
    const opt = q.options[optionIndex];
    if (!opt) return;
    Object.entries(opt.scores).forEach(([key, pts]) => {
      totals[key] = (totals[key] || 0) + pts;
    });
  });
  const maxScore = Math.max(...Object.values(totals), 1);
  return Object.entries(totals)
    .map(([key, score]) => {
      const career = CAREER_KEY_MAP[key] || key;
      const meta   = CAREER_META[career] || {};
      return {
        key, career, score,
        pct: Math.round((score / maxScore) * 100),
        ...meta,
      };
    })
    .sort((a, b) => b.score - a.score);
}
