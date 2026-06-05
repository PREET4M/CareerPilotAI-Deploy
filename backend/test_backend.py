# Automated Backend Verification Script
import os
import json
from database.db import init_db, get_db_connection, create_user, get_user_by_username
from services.ai_service import analyze_resume_heuristics, get_readiness_level
from services.pdf_report_service import generate_pdf_report

def run_tests():
    print("=== CareerPilot AI Backend Verification ===")
    
    # 1. Initialize SQLite Database
    print("\n[Test 1] Initializing SQLite DB...")
    init_db()
    print("Database initialized successfully.")
    
    # 2. Test User creation
    print("\n[Test 2] Testing database user insertion...")
    conn = get_db_connection()
    # Clean up test user if exists
    conn.execute("DELETE FROM users WHERE username = ?", ("test_verified_user",))
    conn.commit()
    conn.close()
    
    user_id = create_user("test_verified_user", "hashed_password_abc_123")
    assert user_id is not None, "Failed to create user"
    print(f"User created successfully with ID: {user_id}")
    
    user = get_user_by_username("test_verified_user")
    assert user is not None, "Failed to query created user"
    assert user['username'] == "test_verified_user", "Username mismatch"
    print("User registration and lookup verified.")
    
    # 3. Test Heuristic Skill Matching
    print("\n[Test 3] Testing rule-based NLP parser...")
    resume_text = """
    John Doe
    Software Engineer Developer
    Skills: Python, Java, Docker, Git, REST APIs, SQL, Data Structures and Algorithms.
    Experience with Scrum / Agile team setups.
    """
    analysis = analyze_resume_heuristics(resume_text, "Software Engineer")
    print(f"Readiness Score: {analysis['score']}")
    print(f"Readiness Level: {analysis['readiness_level']}")
    print(f"Matched Skills: {analysis['matched_skills']}")
    print(f"Missing Skills: {analysis['missing_skills']}")
    
    # Assert readiness score is computed
    assert analysis['score'] > 0, "Score calculation failed"
    assert "Python" in analysis['matched_skills'], "Python should be matched"
    assert "Kubernetes" not in analysis['matched_skills'], "Kubernetes should be missing"
    print("Skill matching engine verified.")
    
    # 4. Test ReportLab PDF Generator
    print("\n[Test 4] Testing PDF Report generation...")
    pdf_stream = generate_pdf_report(analysis, "test_verified_user")
    pdf_bytes = pdf_stream.read()
    print(f"Generated PDF Size: {len(pdf_bytes)} bytes")
    assert len(pdf_bytes) > 1000, "Generated PDF is empty or invalid"
    
    # Save a copy locally for manual verification
    test_pdf_path = os.path.join(os.path.dirname(__file__), "test_verified_report.pdf")
    with open(test_pdf_path, 'wb') as f:
        f.write(pdf_bytes)
    print(f"Verification PDF saved successfully at {test_pdf_path}")
    
    print("\n=== All Backend Checks Passed Successfully! ===")

if __name__ == "__main__":
    run_tests()
