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

@auth_bp.route('/api/register', methods=['POST'])
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
        is_student = data.get('isStudent', True)  # Default to student if not specified
        section = data.get('section')

        # Log registration attempt
        logger.info(f"Registration attempt for email: {email}")

        # Validate required fields
        if not all([email, password, first_name, last_name]):
            return jsonify({'error': 'All fields are required'}), 400

        # Additional validation for students only
        if is_student and not section:
            return jsonify({'error': 'Section is required for students'}), 400

        # Check if user already exists
        if User.objects(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        try:
            # Create new user with proper user_type
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
            session['user_type'] = 'student' if is_student else 'professor'
            session.permanent = True

            # Log successful registration
            logger.info(f"Successfully registered user: {email}")

            return jsonify({
                'success': True,
                'message': 'Registration successful',
                'user': new_user.to_json()
            }), 201

        except NotUniqueError:
            logger.error(f"Duplicate email error for: {email}")
            return jsonify({'error': 'Email already registered'}), 400
        except ValidationError as e:
            logger.error(f"Validation error during registration: {str(e)}")
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return jsonify({'error': 'Failed to create user'}), 500

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
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

        # Log login attempt
        logger.info(f"Login attempt for email: {email} as {'student' if is_student else 'professor'}")

        # Find user by email
        user = User.objects(email=email).first()
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        # Check password
        if not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Check if user type matches the login portal
        if is_student != (user.user_type == 'student'):
            portal_type = 'student' if is_student else 'professor'
            actual_type = user.user_type
            return jsonify({
                'error': f'Please use the {actual_type} portal to login. You are trying to login through the {portal_type} portal.'
            }), 401

        # Update last login
        user.last_login = datetime.utcnow()
        user.save()

        # Set session
        session['user_id'] = str(user.id)
        session['user_type'] = user.user_type
        session.permanent = True

        # Log successful login
        logger.info(f"Successful login for {email} as {user.user_type}")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_json()
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/api/check-session', methods=['GET'])
def check_session():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'logged_in': False,
                'user': None
            })

        user = User.objects(id=user_id).first()
        if not user:
            session.clear()
            return jsonify({
                'logged_in': False,
                'user': None
            })

        return jsonify({
            'logged_in': True,
            'user_type': 'student' if not user.is_professor else 'professor',
            'user': user.to_json()
        })

    except Exception as e:
        logger.error(f"Session check error: {str(e)}")
        return jsonify({'error': 'Session check failed'}), 500

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    try:
        session.clear()
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed'}), 500

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