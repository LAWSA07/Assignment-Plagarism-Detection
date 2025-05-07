from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
import logging
from datetime import datetime
from mongoengine.errors import NotUniqueError, ValidationError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract and validate required fields
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        is_student = data.get('isStudent', True)
        section = data.get('section')

        # Validate required fields
        if not all([email, password, first_name, last_name]):
            return jsonify({'error': 'All fields are required'}), 400

        if is_student and not section:
            return jsonify({'error': 'Section is required for students'}), 400

        # Create new user
        new_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            user_type='student' if is_student else 'professor',
            is_professor=not is_student,
            section=section if is_student else None
        )
        new_user.set_password(password)
        new_user.save()

        # Set session
        session['user_id'] = str(new_user.id)
        session['user_type'] = new_user.user_type
        session.permanent = True

        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': new_user.to_json()
        }), 201

    except NotUniqueError:
        return jsonify({'error': 'Email already registered'}), 400
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')
        is_student = data.get('isStudent', True)

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Find user
        user = User.objects(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Verify user type
        if is_student != (user.user_type == 'student'):
            portal_type = 'student' if is_student else 'professor'
            return jsonify({'error': f'Please use the {user.user_type} portal to login'}), 401

        # Set session data
        session.clear()  # Clear any existing session
        session['user_id'] = str(user.id)
        session['user_type'] = user.user_type
        session['email'] = user.email
        session.permanent = True

        logger.info(f"Login successful for {email}. Session data: {dict(session)}")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_json()
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/api/auth/check-session', methods=['GET'])
def check_session():
    try:
        logger.info(f"Checking session. Current session data: {dict(session)}")

        user_id = session.get('user_id')
        if not user_id:
            logger.info("No user_id in session")
            return jsonify({'logged_in': False})

        user = User.objects(id=user_id).first()
        if not user:
            logger.info(f"No user found for id: {user_id}")
            session.clear()
            return jsonify({'logged_in': False})

        logger.info(f"Session valid for user: {user.email}")
        return jsonify({
            'logged_in': True,
            'user_type': user.user_type,
            'user': user.to_json()
        })

    except Exception as e:
        logger.error(f"Session check error: {str(e)}")
        return jsonify({'error': 'Session check failed'}), 500

@auth_bp.route('/auth/logout', methods=['POST'])
@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    logger.info(f"Auth blueprint logout route called from: {request.headers.get('Origin')}")
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

def handle_preflight():
    response = jsonify({'message': 'Preflight request handled'})
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response, 200

# Authentication middleware
def token_required(f):
    """Decorator to require valid token for routes."""
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401

        token = auth_header.replace('Bearer ', '')
        user = verify_session(token)

        if not user:
            return jsonify({'error': 'Invalid or expired token'}), 401

        return f(*args, **kwargs)

    return decorated