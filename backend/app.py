import os
import uuid
from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import Config
from database.db import (
    init_db, create_user, get_user_by_username, get_user_by_id,
    save_analysis, get_user_analyses, get_analysis_by_id
)
from services.auth_service import hash_password, check_password
from services.resume_service import extract_text_from_pdf
from services.ai_service import analyze_resume
from services.pdf_report_service import generate_pdf_report

# Initialize database
init_db()

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend development servers, allowing credentials/session sharing
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
)

# Helper to verify session login status
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return get_user_by_id(user_id)

# ----------------- Auth Endpoints -----------------

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    if len(username) < 3 or len(password) < 6:
        return jsonify({"error": "Username must be at least 3 chars; password at least 6"}), 400
        
    # Check if user already exists
    existing = get_user_by_username(username)
    if existing:
        return jsonify({"error": "Username already taken"}), 409
        
    p_hash = hash_password(password)
    user_id = create_user(username, p_hash)
    
    if not user_id:
        return jsonify({"error": "Database error registering user"}), 500
        
    # Log the user in immediately
    session['user_id'] = user_id
    session['username'] = username
    
    return jsonify({
        "message": "User registered successfully",
        "user": {"id": user_id, "username": username}
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    user = get_user_by_username(username)
    if not user or not check_password(password, user['password_hash']):
        return jsonify({"error": "Invalid username or password"}), 401
        
    session['user_id'] = user['id']
    session['username'] = user['username']
    
    return jsonify({
        "message": "Logged in successfully",
        "user": {"id": user['id'], "username": user['username']}
    }), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/me', methods=['GET'])
def me():
    user = get_current_user()
    if not user:
        return jsonify({"logged_in": False}), 200
        
    return jsonify({
        "logged_in": True,
        "user": {"id": user['id'], "username": user['username']}
    }), 200

# ----------------- Analysis Endpoints -----------------

@app.route('/api/analyze', methods=['POST'])
def analyze():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401
        
    # Validate request
    if 'resume' not in request.files:
        return jsonify({"error": "Resume file is required"}), 400
        
    role = request.form.get('role', '').strip()
    if not role:
        return jsonify({"error": "Target career role is required"}), 400
        
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are supported"}), 400
        
    # Save the file securely to the uploads folder
    safe_name = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_name)
    file.save(temp_path)
    
    try:
        # 1. Parse text from PDF
        text = extract_text_from_pdf(temp_path)
        if not text.strip():
            return jsonify({"error": "Could not extract text from the PDF. The file may be empty or corrupted."}), 422
            
        # 2. Run analysis matching
        analysis = analyze_resume(text, role)
        
        # 3. Save result to database
        analysis_id = save_analysis(
            user_id=user['id'],
            filename=file.filename,
            role=role,
            score=analysis['score'],
            matched_skills=analysis['matched_skills'],
            missing_skills=analysis['missing_skills'],
            roadmap=analysis['roadmap'],
            learning_resources=analysis['learning_resources']
        )
        
        if not analysis_id:
            return jsonify({"error": "Error saving analysis to history database"}), 500
            
        analysis['id'] = analysis_id
        analysis['filename'] = file.filename
        analysis['role'] = role
        
        return jsonify(analysis), 200
        
    except Exception as e:
        app.logger.error(f"Error processing resume: {e}")
        return jsonify({"error": f"An error occurred during analysis: {str(e)}"}), 500
        
    finally:
        # Clean up temporary uploaded file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                app.logger.warning(f"Failed to remove temp file {temp_path}: {e}")

@app.route('/api/history', methods=['GET'])
def history():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401
        
    records = get_user_analyses(user['id'])
    return jsonify(records), 200

@app.route('/api/analysis/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401
        
    detail = get_analysis_by_id(analysis_id, user['id'])
    if not detail:
        return jsonify({"error": "Analysis not found or access denied"}), 404
        
    return jsonify(detail), 200

@app.route('/api/analysis/<int:analysis_id>/pdf', methods=['GET'])
def get_analysis_pdf(analysis_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401
        
    detail = get_analysis_by_id(analysis_id, user['id'])
    if not detail:
        return jsonify({"error": "Analysis not found or access denied"}), 404
        
    # Generate the ReportLab PDF in memory
    pdf_buffer = generate_pdf_report(detail, user['username'])
    
    # Format a safe downloadable filename
    clean_role = detail['role'].replace(' ', '_').lower()
    filename = f"careerpilot_{clean_role}_report.pdf"
    
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=filename
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=app.config['PORT'], debug=True)
