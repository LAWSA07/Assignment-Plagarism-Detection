import sqlite3
import os
import hashlib
import secrets
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assignment_checker.db')
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

def get_db_connection():
    """Create a database connection."""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {e}")
        raise

def init_db():
    """Initialize the database with schema."""
    try:
        conn = get_db_connection()
        with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'schema.sql'), 'r') as f:
            conn.executescript(f.read())
        conn.commit()
        
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise
    finally:
        conn.close()

# Authentication functions
def hash_password(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(email: str, password: str, full_name: str, user_type: str) -> Optional[int]:
    """Create a new user and return user ID if successful."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone() is not None:
            return None
            
        password_hash = hash_password(password)
        cursor.execute(
            'INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)',
            (email, password_hash, full_name, user_type)
        )
        conn.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        logger.error(f"Error creating user: {e}")
        return None
    finally:
        conn.close()

def verify_user(email: str, password: str) -> Optional[Dict]:
    """Verify user credentials and return user data if valid."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        password_hash = hash_password(password)
        cursor.execute(
            'SELECT id, email, full_name, user_type FROM users WHERE email = ? AND password_hash = ?',
            (email, password_hash)
        )
        user = cursor.fetchone()
        
        if user:
            return dict(user)
        return None
    except sqlite3.Error as e:
        logger.error(f"Error verifying user: {e}")
        return None
    finally:
        conn.close()

def create_session(user_id: int) -> Optional[str]:
    """Create a new session for a user and return the session token."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First, invalidate any existing sessions for this user
        cursor.execute(
            'UPDATE sessions SET is_valid = 0 WHERE user_id = ?',
            (user_id,)
        )
        
        token = secrets.token_hex(32)
        expires_at = datetime.now() + timedelta(days=7)
        
        cursor.execute(
            'INSERT INTO sessions (user_id, token, expires_at, is_valid) VALUES (?, ?, ?, 1)',
            (user_id, token, expires_at)
        )
        conn.commit()
        return token
    except sqlite3.Error as e:
        logger.error(f"Error creating session: {e}")
        return None
    finally:
        conn.close()

def verify_session(token: str) -> Optional[Dict]:
    """Verify a session token and return user data if valid."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT u.id, u.email, u.full_name, u.user_type 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > ? AND s.is_valid = 1
        ''', (token, datetime.now()))
        
        user = cursor.fetchone()
        if user:
            return dict(user)
        return None
    except sqlite3.Error as e:
        logger.error(f"Error verifying session: {e}")
        return None
    finally:
        conn.close()

def invalidate_session(token: str) -> bool:
    """Invalidate a session token."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE sessions SET is_valid = 0 WHERE token = ?',
            (token,)
        )
        conn.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error invalidating session: {e}")
        return False
    finally:
        conn.close()

def get_user_by_id(user_id: int) -> Optional[Dict]:
    """Get user data by ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT id, email, full_name, user_type FROM users WHERE id = ?',
            (user_id,)
        )
        user = cursor.fetchone()
        
        if user:
            return dict(user)
        return None
    except sqlite3.Error as e:
        logger.error(f"Error getting user: {e}")
        return None
    finally:
        conn.close()

def cleanup_expired_sessions():
    """Clean up expired sessions from the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'DELETE FROM sessions WHERE expires_at < ?',
            (datetime.now(),)
        )
        conn.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error cleaning up sessions: {e}")
        return False
    finally:
        conn.close()

# Assignment functions
def create_assignment(professor_id: int, name: str, description: str, course_id: int,
                     due_date: str, correct_answer: str) -> Optional[int]:
    """Create a new assignment and return its ID if successful."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO assignments (professor_id, name, description, course_id, 
                                   due_date, correct_answer)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (professor_id, name, description, course_id, due_date, correct_answer))
        
        conn.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        logger.error(f"Error creating assignment: {e}")
        return None
    finally:
        conn.close()

def get_assignments(user_id: int, user_type: str) -> List[Dict]:
    """Get assignments for a user based on their role."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if user_type == 'professor':
            cursor.execute('''
                SELECT a.*, c.name as course_name,
                       (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) as submission_count
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                WHERE a.professor_id = ?
                ORDER BY a.due_date DESC
            ''', (user_id,))
        else:
            cursor.execute('''
                SELECT a.*, c.name as course_name,
                       CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as is_submitted
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                JOIN course_enrollments ce ON ce.course_id = c.id
                LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
                WHERE ce.student_id = ? AND a.status = 'active'
                ORDER BY a.due_date ASC
            ''', (user_id, user_id))
        
        return [dict(row) for row in cursor.fetchall()]
    except sqlite3.Error as e:
        logger.error(f"Error fetching assignments: {e}")
        return []
    finally:
        conn.close()

# Submission functions
def save_submission(student_id: int, assignment_id: int, file_path: str,
                   extracted_text: str, word_count: int) -> Optional[int]:
    """Save a new submission and return its ID if successful."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO submissions (student_id, assignment_id, file_path, 
                                   extracted_text, word_count, correctness)
            VALUES (?, ?, ?, ?, ?, 'pending')
        ''', (student_id, assignment_id, file_path, extracted_text, word_count))
        
        conn.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        logger.error(f"Error saving submission: {e}")
        return None
    finally:
        conn.close()

def update_submission_analysis(submission_id: int, similarity_score: float,
                             correctness: str) -> bool:
    """Update submission with analysis results."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE submissions
            SET similarity_score = ?, correctness = ?
            WHERE id = ?
        ''', (similarity_score, correctness, submission_id))
        
        conn.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error updating submission analysis: {e}")
        return False
    finally:
        conn.close()

def save_cheating_detection(submission_id: int, detection_type: str,
                          similarity_score: float, matched_submission_id: Optional[int]) -> bool:
    """Save cheating detection results."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO cheating_detection (submission_id, detection_type, 
                                          similarity_score, matched_submission_id)
            VALUES (?, ?, ?, ?)
        ''', (submission_id, detection_type, similarity_score, matched_submission_id))
        
        conn.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error saving cheating detection: {e}")
        return False
    finally:
        conn.close()

# Course functions
def create_course(name: str, code: str, professor_id: int) -> Optional[int]:
    """Create a new course and return its ID if successful."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO courses (name, code, professor_id)
            VALUES (?, ?, ?)
        ''', (name, code, professor_id))
        
        conn.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        logger.error(f"Error creating course: {e}")
        return None
    finally:
        conn.close()

def enroll_student(student_id: int, course_id: int) -> bool:
    """Enroll a student in a course."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO course_enrollments (student_id, course_id)
            VALUES (?, ?)
        ''', (student_id, course_id))
        
        conn.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"Error enrolling student: {e}")
        return False
    finally:
        conn.close()

def get_courses(user_id: int, user_type: str) -> List[Dict]:
    """Get courses for a user based on their role."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if user_type == 'professor':
            cursor.execute('''
                SELECT c.*, 
                       (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as student_count
                FROM courses c
                WHERE c.professor_id = ?
            ''', (user_id,))
        else:
            cursor.execute('''
                SELECT c.*
                FROM courses c
                JOIN course_enrollments ce ON ce.course_id = c.id
                WHERE ce.student_id = ?
            ''', (user_id,))
        
        return [dict(row) for row in cursor.fetchall()]
    except sqlite3.Error as e:
        logger.error(f"Error fetching courses: {e}")
        return []
    finally:
        conn.close()

def store_submission(student_id: int, assignment_id: int, content: str, word_count: int) -> int:
    """Store a new submission in the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO submissions (student_id, assignment_id, content, word_count)
            VALUES (?, ?, ?, ?)
        ''', (student_id, assignment_id, content, word_count))
        submission_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return submission_id
    except sqlite3.Error as e:
        logger.error(f"Error storing submission: {e}")
        raise

def update_submission_analysis(submission_id: int, similarity_score: float, correctness: str) -> None:
    """Update submission with analysis results."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE submissions
            SET similarity_score = ?, correctness = ?
            WHERE id = ?
        ''', (similarity_score, correctness, submission_id))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        logger.error(f"Error updating submission analysis: {e}")
        raise

def store_cheating_analysis(assignment_id: int, analysis_data: Dict) -> None:
    """Store cheating analysis results."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO analysis_results 
            (assignment_id, total_submissions, suspicious_submissions, 
             exact_copy_cases, paraphrase_cases)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            assignment_id,
            analysis_data['total_submissions'],
            analysis_data['suspicious_submissions'],
            analysis_data['exact_copy_cases'],
            analysis_data['paraphrase_cases']
        ))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        logger.error(f"Error storing cheating analysis: {e}")
        raise

def get_assignment_submissions(assignment_id: int) -> List[Dict]:
    """Get all submissions for an assignment."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.*, u.username, u.full_name
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            WHERE s.assignment_id = ?
            ORDER BY s.submitted_at DESC
        ''', (assignment_id,))
        submissions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return submissions
    except sqlite3.Error as e:
        logger.error(f"Error fetching assignment submissions: {e}")
        raise

def get_student_submissions(student_id: int) -> List[Dict]:
    """Get all submissions for a student."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.*, a.name as assignment_name, a.course
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            WHERE s.student_id = ?
            ORDER BY s.submitted_at DESC
        ''', (student_id,))
        submissions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return submissions
    except sqlite3.Error as e:
        logger.error(f"Error fetching student submissions: {e}")
        raise

def get_assignment_analysis(assignment_id: int) -> Optional[Dict]:
    """Get the latest analysis results for an assignment."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT *
            FROM analysis_results
            WHERE assignment_id = ?
            ORDER BY analyzed_at DESC
            LIMIT 1
        ''', (assignment_id,))
        result = cursor.fetchone()
        conn.close()
        return dict(result) if result else None
    except sqlite3.Error as e:
        logger.error(f"Error fetching assignment analysis: {e}")
        raise

def mark_submission_as_cheating(submission_id: int, cheating_type: str) -> None:
    """Mark a submission as potential cheating case."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE submissions
            SET cheating_detected = ?
            WHERE id = ?
        ''', (cheating_type, submission_id))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        logger.error(f"Error marking submission as cheating: {e}")
        raise 