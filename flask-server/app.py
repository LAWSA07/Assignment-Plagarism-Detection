from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from mongoengine import connect
from mongoengine.connection import ConnectionFailure
from models.user import User
from models.assignment import Assignment
from models.submission import Submission
from routes.assignments import assignments_bp
from routes.auth import auth_bp
from routes.users import users_bp
from config import Config
import os
import logging
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

# Get port from environment variable (Render sets PORT)
port = int(os.getenv('PORT', 10000))
host = '0.0.0.0'  # Always bind to 0.0.0.0 for Render

# Configure CORS with more permissive settings
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://assignment-plagarism-detection-tj5d.vercel.app",
    "https://assignment-plagarism-detection-8mll.vercel.app",
    "https://assignment-plagarism-detection-1.onrender.com",
    "https://assignment-plagarism-detection-s73u-2jzx78tqo-lawsa07s-projects.vercel.app"
]

CORS(app,
     resources={
         r"/*": {
             "origins": allowed_origins,
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Origin", "Accept", "X-Requested-With"],
             "expose_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "max_age": 3600
         }
     })

# MongoDB connection with error handling
try:
    mongodb_uri = os.getenv('MONGODB_URI')
    if not mongodb_uri:
        raise ValueError("MONGODB_URI environment variable is not set")

    connect(
        host=mongodb_uri,
        ssl=True,
        ssl_cert_reqs=None,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    logger.info("Successfully connected to MongoDB Atlas")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Register blueprints with url_prefix
app.register_blueprint(assignments_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')

# Configure session
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.permanent_session_lifetime = timedelta(days=1)

# Set secret key from environment variable
app.secret_key = os.getenv('SECRET_KEY', Config.SECRET_KEY)

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.update({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, Accept, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '3600'
        })
    return response

@app.route('/')
def root():
    """Root endpoint to verify server is running"""
    return jsonify({
        'status': 'online',
        'message': 'Assignment Management System API',
        'version': '1.0',
        'port': port,
        'environment': os.getenv('FLASK_ENV', 'production'),
        'endpoints': {
            'health': '/api/health',
            'auth': {
                'register': '/api/register',
                'login': '/api/login'
            }
        }
    })

@app.route('/health')
@app.route('/api/health')
def health_check():
    """Health check endpoint to verify server status"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running',
        'port': port,
        'environment': os.getenv('FLASK_ENV', 'production')
    })

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Registration data received:", data)  # Debug log

        # Extract user data
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        is_student = data.get('isStudent', True)

        # Validate required fields
        if not all([email, password, first_name, last_name]):
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields'
            }), 400

        # Check if user already exists
        existing_user = User.objects(email=email).first()
        if existing_user:
            return jsonify({
                'status': 'error',
                'message': 'User already exists'
            }), 409

        # Create new user
        new_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_student=is_student
        )
        new_user.set_password(password)
        new_user.save()

        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'user': {
                'email': new_user.email,
                'firstName': new_user.first_name,
                'lastName': new_user.last_name,
                'isStudent': new_user.is_student
            }
        }), 201

    except Exception as e:
        print("Registration error:", str(e))  # Debug log
        return jsonify({
            'status': 'error',
            'message': 'Registration failed',
            'error': str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors with JSON response"""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested URL was not found on the server.',
        'status_code': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors with JSON response"""
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An internal server error occurred.',
        'status_code': 500
    }), 500

# Add preflight handler
@app.route('/', methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_preflight(path=''):
    response = jsonify({'status': 'ok'})
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.update({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, Accept, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '3600'
        })
    return response

if __name__ == '__main__':
    logger.info(f"Starting Flask server on {host}:{port}...")
    app.run(host=host, port=port)