# CareerPilot AI

CareerPilot AI is a production-ready, full-stack career readiness platform. It parses resumes (PDFs), matches extracted skills against selected tech roles, calculates alignment scores, suggests tailored learning courses, and charts a personalized study roadmap. It features a modern, animated dark-theme glassmorphism interface.

---

## Technical Stack

* **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons
* **Backend**: Python Flask, SQLite Database
* **Resume Processing**: `pdfplumber`, `PyPDF2`, with optional `pytesseract` and `pdf2image` OCR fallback
* **Reporting**: `ReportLab` (Stylized PDF generation)
* **AI Analysis**: Dual-mode engine (Local Regex heuristics / Google Gemini 1.5 Flash API)

---

## Project Structure

```text
CareerPilot-AI/
├── backend/                  # Flask application
│   ├── instance/             # SQLite DB folder (auto-created)
│   ├── uploads/              # Temporary upload cache (auto-created)
│   ├── database/             # SQLite configuration
│   │   ├── db.py
│   │   └── schema.sql
│   ├── services/             # Core backend routines
│   │   ├── auth_service.py   # bcrypt password security
│   │   ├── resume_service.py # layered PDF parsing + OCR
│   │   ├── ai_service.py     # Skill match logic (Heuristic/Gemini)
│   │   └── pdf_report_service.py # ReportLab PDF creator
│   ├── .env                  # Port & Secret Keys config
│   ├── app.py                # Server router
│   ├── config.py             # Config parser
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Vite React application
│   ├── src/
│   │   ├── components/       # Layouts & Navbars
│   │   ├── pages/            # Landing, Login, Register, Dashboard, Upload, Result
│   │   ├── utils/            # apiFetch helper
│   │   ├── App.jsx           # App shell and routing
│   │   ├── index.css         # Styling system base
│   │   └── main.jsx          # Render entry point
│   ├── index.html            # Core page framework
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Glassmorphic custom styling tokens
│   └── vite.config.js        # Reverse proxy config for API requests
└── README.md                 # System instructions
```

---

## Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python** (v3.9+ recommended)
* *(Optional)* **Tesseract OCR** and **Poppler** (only needed to scan image-only/scanned PDFs; text-based PDFs run successfully without these).

---

### 1. Backend Configuration

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   copy .env.example .env
   ```
5. *(Optional)* To enable Gemini AI features, edit `.env` and set your key:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
   *If left blank, CareerPilot AI will run in offline rule-based heuristic mode.*
6. Run the Flask server:
   ```bash
   python app.py
   ```
   *The server initializes the database schema automatically and runs on `http://localhost:5000`.*

---

### 2. Frontend Configuration

1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser:
   ```text
   http://localhost:5173
   ```

---

## How It Works

### Career Readiness Levels
Readiness is grouped into four tiers:
* **0 - 40 (Beginner)**: Starting out. Focus on core syntax, terminology, and foundational projects.
* **41 - 60 (Developing)**: Intermediate. Work on compiling individual tools into full systems.
* **61 - 80 (Job Ready)**: Ready for entry-level positions. Focus on a main capstone portfolio project.
* **81 - 100 (Industry Ready)**: Highly aligned. Focus on system refinements, open-source, and mock interview drills.

### Parsing Engine Architecture
1. **Rule-Based Engine (Default)**: Sanitizes input and performs regex search queries with strict boundary checking against a predefined list of 15 key skills per career role. It maps missing skills to online learning courses and schedules a weekly study roadmap.
2. **Gemini API Engine (Active on Key detection)**: Formats a structured prompt to parse text, returns a matching checklist, picks specific web courses, and drafts a custom 12-week roadmap.
3. **Scanned PDF Support**: If the PDF is image-only, `resume_service` automatically attempts to call `pytesseract` and `pdf2image`. If the binary executables are not found on the local system path, it gracefully continues without crashing.
