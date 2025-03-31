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
host = os.getenv('HOST', '0.0.0.0')

# Configure CORS with more permissive settings
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://assignment-plagarism-detection-tj5d.vercel.app",
    "https://assignment-plagarism-detection-8mll.vercel.app",
    "https://assignment-plagarism-detection-1.onrender.com"
]

CORS(app,
     resources={
         r"/*": {
             "origins": allowed_origins,
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"],
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
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        })
    return response

@app.route('/')
def index():
    """Root endpoint to verify server is running"""
    return jsonify({
        'status': 'online',
        'message': 'Assignment Plagiarism Detection API',
        'version': '1.0',
        'port': port,
        'endpoints': {
            'health': '/api/health',
            'auth': {
                'login': '/api/login',
                'register': '/api/register',
                'logout': '/api/logout'
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
        'port': port
    })

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

if __name__ == '__main__':
    logger.info(f"Starting Flask server on port {port}...")
    app.run(debug=False, port=port, host=host)