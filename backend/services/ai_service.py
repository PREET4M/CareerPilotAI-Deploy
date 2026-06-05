import re
import json
import logging
import requests
from config import Config

logger = logging.getLogger(__name__)

# Predefined Career Roles & Core Skill Requirements
ROLE_SKILLS = {
    "Software Engineer": [
        "Python", "Java", "JavaScript", "TypeScript", "Git", "SQL", "Docker", 
        "REST APIs", "CI/CD", "React", "System Design", "Unit Testing", "Agile", "Algorithms", "Data Structures"
    ],
    "Data Scientist": [
        "Python", "SQL", "Machine Learning", "Statistics", "Pandas", "NumPy", 
        "Scikit-learn", "Deep Learning", "Data Visualization", "Tableau", "Data Wrangling", "Probability", "PyTorch", "TensorFlow"
    ],
    "Cybersecurity Analyst": [
        "Networking", "Linux", "Firewalls", "Penetration Testing", "Incident Response", 
        "Cryptography", "Wireshark", "SIEM", "Vulnerability Assessment", "Risk Management", "OWASP", "Threat Hunting", "PowerShell"
    ],
    "UI UX Designer": [
        "Figma", "Wireframing", "Prototyping", "User Research", "Information Architecture", 
        "Usability Testing", "Interaction Design", "Typography", "Color Theory", "Design Systems", "User Journeys", "Sketch", "Adobe XD"
    ],
    "Cloud Engineer": [
        "AWS", "Docker", "Kubernetes", "Terraform", "Linux", "CI/CD", 
        "Cloud Security", "Networking", "Azure", "GCP", "Bash Scripting", "Monitoring", "Ansible"
    ]
}

# Regex synonym mappings for better skill matching
SKILL_SYNONYMS = {
    "Python": r"\bpython\d?\b",
    "Java": r"\bjava(?!script)\b",
    "JavaScript": r"\b(javascript|js)\b",
    "TypeScript": r"\b(typescript|ts)\b",
    "Git": r"\b(git|github|gitlab)\b",
    "SQL": r"\b(sql|mysql|postgresql|sqlite|oracle|nosql)\b",
    "Docker": r"\bdocker\b",
    "REST APIs": r"\b(rest|api|apis|restful|graphql)\b",
    "CI/CD": r"\b(ci/cd|cicd|jenkins|github\s+actions|circleci)\b",
    "React": r"\b(react|reactjs|react\.js)\b",
    "System Design": r"\bsystem\s+design\b",
    "Unit Testing": r"\b(unit\s+testing|pytest|junit|jest|mocha)\b",
    "Agile": r"\b(agile|scrum|kanban)\b",
    "Algorithms": r"\balgorithms?\b",
    "Data Structures": r"\bdata\s+structures?\b",
    
    "Machine Learning": r"\b(machine\s+learning|ml|scikit|regression|random\s+forest|xgboost)\b",
    "Statistics": r"\b(statistics|statistical\s+analysis|hypothesis\s+testing)\b",
    "Pandas": r"\bpandas\b",
    "NumPy": r"\bnumpy\b",
    "Scikit-learn": r"\b(scikit-learn|sklearn)\b",
    "Deep Learning": r"\b(deep\s+learning|neural\s+networks|cnn|rnn)\b",
    "Data Visualization": r"\b(data\s+visualisation|data\s+visualization|matplotlib|seaborn|d3\.js)\b",
    "Tableau": r"\b(tableau|power\s+bi|looker)\b",
    "Data Wrangling": r"\b(data\s+wrangling|data\s+cleaning|preprocessing)\b",
    "Probability": r"\bprobability\b",
    "PyTorch": r"\bpytorch\b",
    "TensorFlow": r"\btensorflow\b",
    
    "Networking": r"\b(networking|tcp/ip|ip|dns|dhcp|routing|switching)\b",
    "Linux": r"\b(linux|ubuntu|debian|redhat|centos)\b",
    "Firewalls": r"\b(firewalls?|ids/ips|vpn|palo\s+alto|fortinet)\b",
    "Penetration Testing": r"\b(penetration\s+testing|pen\s+test|pentesting|ethical\s+hacking|metasploit)\b",
    "Incident Response": r"\b(incident\s+response|ir|incident\s+handling)\b",
    "Cryptography": r"\b(cryptography|encryption|ssl|tls|aes|rsa)\b",
    "Wireshark": r"\bwireshark\b",
    "SIEM": r"\b(siem|splunk|qradar|elk)\b",
    "Vulnerability Assessment": r"\b(vulnerability\s+assessment|vulnerability\s+management|nessus)\b",
    "Risk Management": r"\b(risk\s+management|risk\s+assessment|compliance)\b",
    "OWASP": r"\bowasp\b",
    "Threat Hunting": r"\b(threat\s+hunting|threat\s+intelligence)\b",
    "PowerShell": r"\b(powershell|bash|shell\s+scripting)\b",
    
    "Figma": r"\bfigma\b",
    "Wireframing": r"\b(wireframing|wireframes?)\b",
    "Prototyping": r"\b(prototyping|prototypes?)\b",
    "User Research": r"\buser\s+research\b",
    "Information Architecture": r"\binformation\s+architecture\b",
    "Usability Testing": r"\b(usability\s+testing|user\s+testing)\b",
    "Interaction Design": r"\b(interaction\s+design|ixd)\b",
    "Typography": r"\b(typography|fonts)\b",
    "Color Theory": r"\b(color\s+theory|palette)\b",
    "Design Systems": r"\bdesign\s+systems?\b",
    "User Journeys": r"\b(user\s+journeys?|personas?|storyboards?)\b",
    "Sketch": r"\bsketch\b",
    "Adobe XD": r"\b(adobe\s+xd|photoshop|illustrator)\b",
    
    "AWS": r"\b(aws|amazon\s+web\s+services|ec2|s3|rds|lambda|iam)\b",
    "Docker": r"\bdocker\b",
    "Kubernetes": r"\b(kubernetes|k8s)\b",
    "Terraform": r"\b(terraform|iac|cloudformation)\b",
    "Cloud Security": r"\b(cloud\s+security|iam|kms)\b",
    "Azure": r"\b(azure|microsoft\s+azure)\b",
    "GCP": r"\b(gcp|google\s+cloud|google\s+cloud\s+platform)\b",
    "Bash Scripting": r"\b(bash|shell|scripting|powershell)\b",
    "Monitoring": r"\b(monitoring|prometheus|grafana|cloudwatch|datadog)\b",
    "Ansible": r"\b(ansible|chef|puppet)\b"
}

# Offline Predefined Course & Book Library
SKILL_RESOURCES = {
    "Python": {"name": "Python for Everybody (Coursera)", "type": "Course", "url": "https://www.coursera.org/specializations/python", "desc": "Learn core programming concepts using Python."},
    "Java": {"name": "Java Programming and Software Engineering Fundamentals (Duke)", "type": "Course", "url": "https://www.coursera.org/specializations/java-programming", "desc": "Solid foundation in Java syntax and object-oriented concepts."},
    "JavaScript": {"name": "The Complete JavaScript Course (Udemy)", "type": "Course", "url": "https://www.udemy.com/course/the-complete-javascript-course/", "desc": "Master JavaScript from beginner to advanced projects."},
    "TypeScript": {"name": "Understanding TypeScript (Academind)", "type": "Course", "url": "https://www.udemy.com/course/understanding-typescript/", "desc": "Learn TypeScript, its compiler, and integration with React/Node."},
    "Git": {"name": "Version Control with Git (Udacity)", "type": "Course", "url": "https://www.udacity.com/course/version-control-with-git--ud123", "desc": "Free course on managing project history and collaboration."},
    "SQL": {"name": "Introduction to Databases and SQL (Stanford/edX)", "type": "Course", "url": "https://www.edx.org/course/databases-5-sql", "desc": "Master relational databases, queries, and joins."},
    "Docker": {"name": "Docker & Kubernetes: The Practical Guide (Maximilian Schwarzmüller)", "type": "Course", "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", "desc": "Build, test, and deploy containers."},
    "REST APIs": {"name": "Designing RESTful APIs (Udacity)", "type": "Course", "url": "https://www.udacity.com/course/designing-restful-apis--ud388", "desc": "Learn to design secure and clean REST endpoints."},
    "CI/CD": {"name": "DevOps CI/CD with Jenkins, Pipelines, and Git (Udemy)", "type": "Course", "url": "https://www.udemy.com/course/devops-pipeline-jenkins-docker/", "desc": "Automate code compilation, testing, and deployment."},
    "React": {"name": "React - The Complete Guide (Academind)", "type": "Course", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "desc": "Master React, Hooks, Redux, and Routing."},
    "System Design": {"name": "System Design Primer (GitHub Repository)", "type": "Resource", "url": "https://github.com/donnemartin/system-design-primer", "desc": "Learn how to build large-scale, distributed systems."},
    "Unit Testing": {"name": "Python Testing with pytest (Pragmatic Bookshelf)", "type": "Book", "url": "https://pragprog.com/titles/bopytest2/python-testing-with-pytest-second-edition/", "desc": "Excellent handbook on writing clean, scalable tests."},
    "Agile": {"name": "Agile Planning and Execution (Google/Coursera)", "type": "Course", "url": "https://www.coursera.org/learn/agile-project-management", "desc": "Understand Scrum, Kanban, sprints, and agile ceremonies."},
    "Algorithms": {"name": "Algorithms, Part I & II (Princeton/Coursera)", "type": "Course", "url": "https://www.coursera.org/learn/algorithms-part1", "desc": "Classic introduction to sorting, searching, and graphs."},
    "Data Structures": {"name": "Data Structures and Algorithms Specialization (UC San Diego)", "type": "Course", "url": "https://www.coursera.org/specializations/data-structures-algorithms", "desc": "Implement essential structures from scratch."},
    
    "Machine Learning": {"name": "Machine Learning Specialization (Andrew Ng / DeepLearning.AI)", "type": "Course", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "desc": "The gold standard introduction to ML algorithms and practices."},
    "Statistics": {"name": "Practical Statistics for Data Scientists (O'Reilly)", "type": "Book", "url": "https://www.oreilly.com/library/view/practical-statistics-for/9781492072935/", "desc": "Essential statistics concepts applied in R and Python."},
    "Pandas": {"name": "Data Analysis with Python and Pandas (Kaggle)", "type": "Course", "url": "https://www.kaggle.com/learn/pandas", "desc": "Free interactive tutorial to manipulate data frames."},
    "NumPy": {"name": "NumPy Reference and Tutorials (NumPy.org)", "type": "Documentation", "url": "https://numpy.org/doc/stable/user/index.html", "desc": "Official guide to numerical computing in Python."},
    "Scikit-learn": {"name": "Machine Learning with Python and Scikit-Learn (YouTube - freeCodeCamp)", "type": "Video", "url": "https://www.youtube.com/watch?v=M9Itm95JzL0", "desc": "Detailed guide on building estimators and pipelines."},
    "Deep Learning": {"name": "Deep Learning Specialization (DeepLearning.AI)", "type": "Course", "url": "https://www.coursera.org/specializations/deep-learning", "desc": "Master neural networks, backpropagation, CNNs, and sequence models."},
    "Data Visualization": {"name": "Data Visualization Nanodegree (Udacity)", "type": "Course", "url": "https://www.udacity.com/course/data-visualization-nanodegree--nd197", "desc": "Design dashboards and tell stories with data."},
    "Tableau": {"name": "Tableau 2024 A-Z (Udemy)", "type": "Course", "url": "https://www.udemy.com/course/tableau10/", "desc": "Learn Tableau step-by-step with real-life data sets."},
    "Data Wrangling": {"name": "Data Cleaning & Wrangling (Kaggle)", "type": "Course", "url": "https://www.kaggle.com/learn/data-cleaning", "desc": "Handle missing values, scaling, normalization, and dates."},
    "Probability": {"name": "Introduction to Probability (MIT OpenCourseWare)", "type": "Course", "url": "https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/", "desc": "Rigorous foundation in random variables and distributions."},
    "PyTorch": {"name": "PyTorch for Deep Learning Bootcamp (Zero To Mastery)", "type": "Course", "url": "https://dbader.org/pytorch-course", "desc": "Write neural networks using PyTorch syntax."},
    "TensorFlow": {"name": "DeepLearning.AI TensorFlow Developer (Coursera)", "type": "Course", "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice", "desc": "Build ML applications with TensorFlow APIs."},
    
    "Networking": {"name": "CompTIA Network+ Course (Professor Messer)", "type": "Video", "url": "https://www.professormesser.com/", "desc": "Free high-quality video training for network foundations."},
    "Linux": {"name": "Linux Command Line Basics (Udacity)", "type": "Course", "url": "https://www.udacity.com/course/linux-command-line-basics--ud595", "desc": "Master the terminal, file systems, and user permissions."},
    "Firewalls": {"name": "Network Security and Firewalls (Coursera)", "type": "Course", "url": "https://www.coursera.org/learn/network-security-firewalls", "desc": "Configure firewalls, VPNs, and intrusion detection systems."},
    "Penetration Testing": {"name": "Practical Ethical Hacking (TCM Security)", "type": "Course", "url": "https://academy.tcm-sec.com/p/practical-ethical-hacking-the-complete-course", "desc": "Great hands-on training for active vulnerability hunting."},
    "Incident Response": {"name": "Incident Response and Threat Mitigation (Infosec)", "type": "Course", "url": "https://www.infosecinstitute.com/learning-paths/incident-response-handler/", "desc": "Plan for, mitigate, and recover from cybersecurity breaches."},
    "Cryptography": {"name": "Cryptography I (Stanford / Coursera)", "type": "Course", "url": "https://www.coursera.org/learn/crypto", "desc": "Mathematical foundations of encryption, hash functions, and keys."},
    "Wireshark": {"name": "Wireshark Network Analysis (Laura Chappell)", "type": "Book", "url": "https://www.wiresharkbook.com/", "desc": "The ultimate handbook on packet analysis and troubleshooting."},
    "SIEM": {"name": "Splunk Fundamentals 1 (Splunk)", "type": "Course", "url": "https://www.splunk.com/en_us/training/free-courses/splunk-fundamentals-1.html", "desc": "Free course on indexing, searching, and creating dashboards."},
    "Vulnerability Assessment": {"name": "Vulnerability Assessment Foundations (Pluralsight)", "type": "Course", "url": "https://www.pluralsight.com/courses/vulnerability-assessment-foundations", "desc": "Identify and classify security vulnerabilities in networks."},
    "Risk Management": {"name": "NIST Risk Management Framework Course", "type": "Resource", "url": "https://csrc.nist.gov/projects/risk-management", "desc": "Official documentation and guides for risk evaluation frameworks."},
    "OWASP": {"name": "OWASP Top 10 Web Application Security Risks (OWASP.org)", "type": "Documentation", "url": "https://owasp.org/www-project-top-ten/", "desc": "Essential reading for understanding standard web exploits."},
    "Threat Hunting": {"name": "Threat Hunting Academy (Active Countermeasures)", "type": "Course", "url": "https://www.activecountermeasures.com/free-threat-hunting-training/", "desc": "Hands-on threat emulation and host inspection."},
    "PowerShell": {"name": "Learn Windows PowerShell in a Month of Lunches (Manning)", "type": "Book", "url": "https://www.manning.com/books/learn-windows-powershell-in-a-month-of-lunches-third-edition", "desc": "Excellent guide to automating tasks via PowerShell script."},
    
    "Figma": {"name": "Figma UI/UX Design Essentials (Udemy)", "type": "Course", "url": "https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial/", "desc": "Learn how to use Figma for wireframing and interactive UI design."},
    "Wireframing": {"name": "Wireframing with Balsamiq (Balsamiq Tutorials)", "type": "Resource", "url": "https://balsamiq.com/learn/tutorials/", "desc": "Guide to building low-fidelity sketches and UI layouts."},
    "Prototyping": {"name": "UX Prototyping (Interaction Design Foundation)", "type": "Course", "url": "https://www.interaction-design.org/courses/ux-prototyping", "desc": "Design prototypes of varying levels of fidelity."},
    "User Research": {"name": "User Research - Methods and Best Practices (IDF)", "type": "Course", "url": "https://www.interaction-design.org/courses/user-research-methods-and-best-practices", "desc": "Conduct research, interview clients, and interpret user feedback."},
    "Information Architecture": {"name": "Information Architecture: Gateway to UX (IDF)", "type": "Course", "url": "https://www.interaction-design.org/courses/information-architecture", "desc": "Design structural flows, search indexing, and labels."},
    "Usability Testing": {"name": "Conducting Usability Testing (Interaction Design Foundation)", "type": "Course", "url": "https://www.interaction-design.org/courses/conducting-usability-testing", "desc": "Plan, moderate, and evaluate standard user test sheets."},
    "Interaction Design": {"name": "About Face: The Essentials of Interaction Design (Wiley)", "type": "Book", "url": "https://www.wiley.com/en-us/About+Face%3A+The+Essentials+of+Interaction+Design%2C+4th+Edition-p-9781118766576", "desc": "Comprehensive book on desktop and mobile product interaction."},
    "Typography": {"name": "Better Web Typography for a Better Web (Matej Latin)", "type": "Book/Resource", "url": "https://betterwebtypography.com/", "desc": "Learn how to size, scale, and structure copy elements."},
    "Color Theory": {"name": "Interaction Design Foundation: Color Theory", "type": "Resource", "url": "https://www.interaction-design.org/literature/topics/color-theory", "desc": "Guides on visual hierarchy, saturation, and contrast choices."},
    "Design Systems": {"name": "Design Systems Handbook (DesignBetter.co)", "type": "Book", "url": "https://www.designbetter.co/design-systems-handbook", "desc": "Guide to design components, tokens, and visual standards."},
    "User Journeys": {"name": "Customer Journey Mapping (Coursera)", "type": "Course", "url": "https://www.coursera.org/learn/customer-journey-mapping", "desc": "Understand user psychology and path flows."},
    "Sketch": {"name": "Sketch Design Academy", "type": "Resource", "url": "https://www.sketch.com/community/", "desc": "Official tutorials for vector design on macOS."},
    "Adobe XD": {"name": "Adobe XD Course (Adobe)", "type": "Resource", "url": "https://letsxd.com/", "desc": "Interactive guides to responsive designs in XD."},
    
    "AWS": {"name": "AWS Certified Cloud Practitioner (Stephane Maarek)", "type": "Course", "url": "https://www.udemy.com/course/aws-certified-cloud-practitioner-new/", "desc": "Comprehensive introduction to AWS fundamentals and core services."},
    "Kubernetes": {"name": "Kubernetes for Developers (Linux Foundation)", "type": "Course", "url": "https://training.linuxfoundation.org/training/kubernetes-for-developers/", "desc": "Learn container orchestration and deployment configurations."},
    "Terraform": {"name": "HashiCorp Certified: Terraform Associate (Zeal Vora)", "type": "Course", "url": "https://www.udemy.com/course/terraform-beginner-to-advanced/", "desc": "Master Infrastructure as Code using HCL syntax."},
    "Cloud Security": {"name": "AWS Certified Security - Specialty (Udemy)", "type": "Course", "url": "https://www.udemy.com/course/aws-certified-security-specialty-s/", "desc": "Encryption, IAM, firewalls, and logging policies in cloud environments."},
    "Azure": {"name": "Microsoft Azure Fundamentals AZ-900 (Scott Duffy)", "type": "Course", "url": "https://www.udemy.com/course/az900-azure/", "desc": "Introduction to Azure cloud components, networking, and security."},
    "GCP": {"name": "Google Associate Cloud Engineer (Google Cloud Training)", "type": "Course", "url": "https://www.coursera.org/professional-certificates/gcp-cloud-architect", "desc": "Deploy apps and monitor infrastructure inside GCP."},
    "Bash Scripting": {"name": "Shell Scripting Tutorial (ShellScript.sh)", "type": "Resource", "url": "https://www.shellscript.sh/", "desc": "Excellent free text-based tutorial for writing automation scripts."},
    "Monitoring": {"name": "Monitoring and Observability (YouTube - TechWorld with Nana)", "type": "Video", "url": "https://www.youtube.com/watch?v=hZ7yS0t-Pug", "desc": "Great introduction to Prometheus and Grafana metrics."},
    "Ansible": {"name": "Ansible for DevOps (Jeff Geerling)", "type": "Book", "url": "https://www.ansiblefordevops.com/", "desc": "Excellent guide to configuration management and playbook writing."}
}

def get_readiness_level(score: int) -> str:
    """
    Returns the career readiness category based on the numerical score.
    """
    if score <= 40:
        return "Beginner"
    elif score <= 60:
        return "Developing"
    elif score <= 80:
        return "Job Ready"
    else:
        return "Industry Ready"

# ----------------- Offline Matcher -----------------
def analyze_resume_heuristics(resume_text: str, target_role: str) -> dict:
    """
    Core rule-based skill comparison engine.
    Matches text using regular expressions with word boundaries.
    Calculates score, splits matched vs missing skills, and extracts relevant courses.
    """
    if target_role not in ROLE_SKILLS:
        raise ValueError(f"Unknown target role: {target_role}")

    # Standardize resume text
    clean_text = resume_text.lower()
    
    role_skills_list = ROLE_SKILLS[target_role]
    matched = []
    missing = []
    
    # 1. Match skills
    for skill in role_skills_list:
        pattern_str = SKILL_SYNONYMS.get(skill, rf"\b{re.escape(skill.lower())}\b")
        pattern = re.compile(pattern_str, re.IGNORECASE)
        
        if pattern.search(clean_text):
            matched.append(skill)
        else:
            missing.append(skill)
            
    # 2. Calculate score
    total_skills = len(role_skills_list)
    match_percentage = len(matched) / total_skills if total_skills > 0 else 0
    
    # Add a small base score adjustment (up to 15 points) for generic resume indicators
    # representing general readiness (e.g. mentions of projects, team, degree, experience)
    base_boost = 0
    professional_keywords = ["experience", "education", "project", "team", "degree", "lead", "manage", "collaborate"]
    for kw in professional_keywords:
        if kw in clean_text:
            base_boost += 2
    
    score = int((match_percentage * 85) + base_boost)
    score = min(max(score, 5), 100) # Clamp score between 5 and 100
    
    # If they matched everything, let's make it 95-100
    if len(missing) == 0:
        score = 100
        
    readiness_level = get_readiness_level(score)
    
    # 3. Pick learning resources for missing skills
    learning_resources = []
    for skill in missing[:4]: # Recommend resources for up to 4 missing skills
        if skill in SKILL_RESOURCES:
            learning_resources.append(SKILL_RESOURCES[skill])
            
    # Fallback/filler resource in case they matched almost everything
    if len(learning_resources) < 2:
        for skill in matched[:2]:
            resource_key = f"{skill} Advanced"
            # If we don't have an advanced resource, recommend the main one as a refresher
            if skill in SKILL_RESOURCES and SKILL_RESOURCES[skill] not in learning_resources:
                learning_resources.append(SKILL_RESOURCES[skill])

    # 4. Generate a 4-phase learning roadmap based on missing and matched skills
    roadmap = generate_heuristic_roadmap(target_role, matched, missing)
    
    return {
        "score": score,
        "readiness_level": readiness_level,
        "matched_skills": matched,
        "missing_skills": missing,
        "learning_resources": learning_resources,
        "roadmap": roadmap,
        "engine": "Heuristic (Offline)"
    }

def generate_heuristic_roadmap(role: str, matched: list, missing: list) -> list:
    """
    Compiles a structured 4-phase learning plan dynamically grouping skills.
    """
    # Create phases
    roadmap = []
    
    # Distribute missing skills across phases. Prepend matched skills as foundational.
    phase_1_skills = [s for s in matched[:3]]
    phase_2_skills = [s for s in missing[:2]]
    phase_3_skills = [s for s in missing[2:5]]
    phase_4_skills = [s for s in missing[5:]]
    
    # Clean up lists (ensure no empty/small arrays if possible)
    if not phase_2_skills:
        phase_2_skills = ["Advanced " + (matched[3] if len(matched) > 3 else "Architecture")]
    if not phase_3_skills:
        phase_3_skills = ["Portfolio Development", "Mock Interviews"]
    if not phase_4_skills:
        phase_4_skills = ["System Integration", "Open Source Contribution"]

    roadmap.append({
        "phase": "Phase 1: Foundation & Review",
        "duration": "Weeks 1 - 2",
        "description": f"Consolidate your existing strengths. Review your foundation in {', '.join(phase_1_skills) if phase_1_skills else 'core role concepts'}.",
        "topics": phase_1_skills + ["Reviewing core documentation", "Setting up local sandbox environment"]
    })
    
    roadmap.append({
        "phase": "Phase 2: Core Skill Gap Mitigation",
        "duration": "Weeks 3 - 6",
        "description": "Focus on high-priority missing skills that are essential for entry-level positions.",
        "topics": phase_2_skills + ["Building small practice modules", "Reading code examples"]
    })
    
    roadmap.append({
        "phase": "Phase 3: Advanced Concepts & Tools",
        "duration": "Weeks 7 - 10",
        "description": "Learn complex tooling and architectural setups required to perform in team settings.",
        "topics": phase_3_skills + ["Deploying applications", "Integrating authentication and databases"]
    })
    
    roadmap.append({
        "phase": "Phase 4: Practical Projects & Interview Prep",
        "duration": "Weeks 11 - 12",
        "description": "Apply all skills in a comprehensive capstone portfolio project and practice common interview questions.",
        "topics": phase_4_skills + ["Designing a capstone project", "Polishing GitHub profile", "Solving coding challenges/system design mocks"]
    })
    
    return roadmap

# ----------------- Gemini API Matcher -----------------
def analyze_resume_gemini(resume_text: str, target_role: str) -> dict:
    """
    Optional Gemini API analysis.
    Constructs a detailed prompt to extract skills and compare against the role,
    returning a structured analysis report in JSON format.
    """
    api_key = Config.GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    role_skills_list = ROLE_SKILLS.get(target_role, [])
    
    prompt = f"""
You are a senior hiring manager and tech recruiter. Analyze the following resume text and compare it to the target role: "{target_role}".
Core required skills for this role: {', '.join(role_skills_list)}.

Please return a JSON object with the following fields:
1. "score": An integer (0 to 100) indicating the candidate's career readiness score.
2. "matched_skills": A list of skills from the core required list (and synonyms) that the candidate possesses.
3. "missing_skills": A list of skills from the core required list that the candidate is missing.
4. "learning_resources": A list of 3-4 recommended courses, books, or documentation sites for the missing skills. Each item should be a dictionary with "name", "type" (Course, Book, Documentation), "url" (or standard placeholder), and "desc" (brief description).
5. "roadmap": A list of 4 phases for a personalized 12-week study plan. Each phase should be a dictionary with "phase" (e.g. "Phase 1: Foundations"), "duration" (e.g. "Weeks 1-2"), "description" (summary of what to do), and "topics" (list of strings/specific items to study).

Ensure the response is STRICTLY valid JSON and contains only the JSON object. Do not include markdown code block syntax (like ```json ... ```).

Resume Text:
---
{resume_text}
---
"""

    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    try:
        logger.info("Sending request to Gemini API...")
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        
        resp_json = response.json()
        raw_text = resp_json['candidates'][0]['content']['parts'][0]['text'].strip()
        
        # Clean markdown code block wraps if the model added them despite instructions
        if raw_text.startswith("```"):
            # Strip first line
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()
            
        data = json.loads(raw_text)
        
        # Enforce schemas and calculate values if missing
        score = int(data.get('score', 50))
        score = min(max(score, 0), 100)
        
        return {
            "score": score,
            "readiness_level": get_readiness_level(score),
            "matched_skills": data.get('matched_skills', []),
            "missing_skills": data.get('missing_skills', []),
            "learning_resources": data.get('learning_resources', []),
            "roadmap": data.get('roadmap', []),
            "engine": "Gemini 1.5 Flash (Online)"
        }
        
    except Exception as e:
        logger.warning(f"Gemini API analysis failed: {e}. Falling back to Heuristic Mode.")
        return analyze_resume_heuristics(resume_text, target_role)

# ----------------- Master Analyzer -----------------
def analyze_resume(resume_text: str, target_role: str) -> dict:
    """
    Dispatches analysis to Gemini if enabled, otherwise uses offline heuristics.
    """
    if Config.is_gemini_enabled():
        return analyze_resume_gemini(resume_text, target_role)
    else:
        return analyze_resume_heuristics(resume_text, target_role)
