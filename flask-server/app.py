from flask import Flask, request, jsonify, session
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
from flask_session import Session

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Environment variables
IS_PRODUCTION = os.getenv('FLASK_ENV') == 'production'
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001')
allowed_origins = ALLOWED_ORIGINS.split(',')

# Use actual deployment URLs
RENDER_BACKEND_URL = 'https://assignment-plagarism-detection-1.onrender.com'  # Corrected URL
VERCEL_FRONTEND_URL = 'https://assignment-plagarism-detection-8mll.vercel.app'  # Actual Vercel domain

logger.info(f"Production status: {IS_PRODUCTION}")

# Always include both production domains to allowed origins
if RENDER_BACKEND_URL not in allowed_origins:
    allowed_origins.append(RENDER_BACKEND_URL)
if VERCEL_FRONTEND_URL not in allowed_origins:
    allowed_origins.append(VERCEL_FRONTEND_URL)

logger.info(f"CORS allowed origins: {allowed_origins}")

# Session configuration
app.config.update(
    SESSION_COOKIE_SECURE=IS_PRODUCTION,  # Set Secure flag only in production
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='None' if IS_PRODUCTION else 'Lax', # Use 'None' in production, 'Lax' in development
    SESSION_COOKIE_NAME='assignment_checker_session',
    PERMANENT_SESSION_LIFETIME=timedelta(days=1),
    SESSION_TYPE='filesystem'
)

# Initialize Flask-Session
Session(app)

# Set secret key
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')  # Change in production

# Enable CORS for all routes with specific configuration
CORS(app,
    resources={r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})

# MongoDB connection with error handling
try:
    mongodb_uri = os.getenv('MONGODB_URI')
    if not mongodb_uri:
        raise ValueError("MONGODB_URI environment variable is not set")

    connect(host=mongodb_uri)
    logger.info("Successfully connected to MongoDB Atlas")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Register blueprints
app.register_blueprint(assignments_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)

@app.before_request
def make_session_permanent():
    session.permanent = True
    # Print session data for debugging
    logger.info(f"Session data: {dict(session)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server status"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running'
    })

@app.route('/api/health', methods=['GET'])
def api_health_check():
    """API health check endpoint for frontend to verify connection"""
    return jsonify({
        'status': 'healthy',
        'message': 'API server is running'
    })

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=True, port=5000, host='0.0.0.0')