from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
from mongoengine import connect
from mongoengine.connection import ConnectionFailure
from models.user import User
from models.assignment import Assignment
from models.submission import Submission
from routes.assignments import assignments_bp
from routes.auth import auth_bp
from routes.users import users_bp
from routes.library import library_bp
from routes.timetable import timetable_bp
from routes.notifications import notifications_bp
from config import Config
import os
import logging
from datetime import timedelta
from dotenv import load_dotenv
from flask_session import Session

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Environment detection
IS_PRODUCTION = os.getenv('FLASK_ENV') == 'production'
logger.info(f"Running in {'PRODUCTION' if IS_PRODUCTION else 'DEVELOPMENT'} mode")

# Add development origins without duplicates
allowed_origins = []
development_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
]

# Add each origin only if it's not already in the list
for origin in development_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

# Add production origins from environment variables
PRODUCTION_ORIGINS = os.getenv('FRONTEND_URLS', '')
if PRODUCTION_ORIGINS:
    for origin in PRODUCTION_ORIGINS.split(','):
        if origin.strip() and origin.strip() not in allowed_origins:
            allowed_origins.append(origin.strip())

# Add self URL to allowed origins
BACKEND_URL = os.getenv('BACKEND_URL', '')
if BACKEND_URL and BACKEND_URL not in allowed_origins:
    allowed_origins.append(BACKEND_URL)

# Hardcode known production domains as fallback
vercel_domains = [
    'https://assignment-plagarism-detection-8mll.vercel.app',
    'https://assignment-plagarism-detection-oun4.vercel.app'
]
for domain in vercel_domains:
    if domain not in allowed_origins:
        allowed_origins.append(domain)

logger.info(f"CORS allowed origins (no duplicates): {allowed_origins}")

# Session configuration
app.config.update(
    SESSION_COOKIE_SECURE=IS_PRODUCTION,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='None' if IS_PRODUCTION else 'Lax',
    SESSION_COOKIE_NAME='assignment_checker_session',
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),
    SESSION_TYPE='filesystem'
)

# Initialize Flask-Session
Session(app)

# Set secret key - use environment variable or generate a random one
app.secret_key = os.getenv('SECRET_KEY', os.urandom(24).hex())

# Configure CORS - works in both dev and production
CORS(app,
    resources={r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Set-Cookie", "Access-Control-Allow-Origin"]
    }})

# Explicitly handle OPTIONS requests for all routes
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    response = app.make_default_options_response()

    # Get origin from request
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')

    return response

# MongoDB connection with error handling
try:
    mongodb_uri = os.getenv('MONGODB_URI')
    if not mongodb_uri:
        # Fallback to localhost MongoDB in development
        if not IS_PRODUCTION:
            mongodb_uri = 'mongodb://localhost:27017/assignment_checker'
            logger.warning(f"MONGODB_URI not set, using default: {mongodb_uri}")
        else:
            raise ValueError("MONGODB_URI environment variable is not set")

    connect(host=mongodb_uri)
    logger.info(f"Successfully connected to MongoDB at: {mongodb_uri.split('@')[-1] if '@' in mongodb_uri else mongodb_uri}")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Register blueprints
app.register_blueprint(assignments_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(library_bp)
app.register_blueprint(timetable_bp)
app.register_blueprint(notifications_bp)

# Non-prefixed route handlers (to support both /api and non-/api routes)
# Auth routes
@app.route('/auth/login', methods=['POST', 'OPTIONS'])
def auth_login_direct():
    logger.info(f"Direct /auth/login route called from: {request.headers.get('Origin')}")
    if request.method == 'OPTIONS':
        return options_handler('auth/login')
    return redirect('/api/auth/login', code=307)  # 307 preserves the method and body

@app.route('/auth/register', methods=['POST', 'OPTIONS'])
def auth_register_direct():
    logger.info(f"Direct /auth/register route called from: {request.headers.get('Origin')}")
    if request.method == 'OPTIONS':
        return options_handler('auth/register')
    return redirect('/api/auth/register', code=307)

@app.route('/auth/logout', methods=['POST', 'OPTIONS'])
def auth_logout_direct():
    logger.info(f"Direct /auth/logout route called from: {request.headers.get('Origin')}")
    if request.method == 'OPTIONS':
        return options_handler('auth/logout')
    return redirect('/api/auth/logout', code=307)

@app.route('/auth/check-session', methods=['GET', 'OPTIONS'])
def auth_check_session_direct():
    logger.info(f"Direct /auth/check-session route called from: {request.headers.get('Origin')}")
    if request.method == 'OPTIONS':
        return options_handler('auth/check-session')
    return redirect('/api/auth/check-session', code=307)

@app.route('/api/logout', methods=['POST', 'OPTIONS'])
def api_logout_direct():
    logger.info(f"Direct /api/logout route called from: {request.headers.get('Origin')}")
    if request.method == 'OPTIONS':
        return options_handler('api/logout')
    # Just clear the session directly without redirect
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

@app.before_request
def log_request_info():
    # Log every request for debugging
    logger.info(f"Request: {request.method} {request.path}")
    logger.info(f"Headers: Origin={request.headers.get('Origin')}, Content-Type={request.headers.get('Content-Type')}")
    logger.info(f"Session data: {dict(session)}")

@app.after_request
def add_cors_headers(response):
    # Log request details for debugging
    logger.info(f"Request: {request.method} {request.path}")

    # Only add CORS headers if they aren't already present
    origin = request.headers.get('Origin')
    if origin in allowed_origins and 'Access-Control-Allow-Origin' not in response.headers:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')

    # For debugging - check response headers
    logger.debug(f"Response headers: {dict(response.headers)}")
    return response

# Health check endpoints (accessible with or without /api prefix)
@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server status"""
    origin = request.headers.get('Origin', 'Unknown')
    logger.info(f"Health check from origin: {origin}")
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running',
        'environment': 'production' if IS_PRODUCTION else 'development'
    })

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=not IS_PRODUCTION, port=5000, host='0.0.0.0')