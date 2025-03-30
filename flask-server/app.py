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

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

# Configure CORS
CORS(app,
     resources={
         r"/api/*": {
             "origins": ["http://localhost:3000", "http://localhost:3001"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"]
         }
     })

# MongoDB connection with error handling
try:
    mongodb_uri = os.getenv('MONGODB_URI')
    if not mongodb_uri:
        raise ValueError("MONGODB_URI environment variable is not set")

    # Adding explicit TLS/SSL options to fix handshake error
    connect(
        host=mongodb_uri,
        ssl=True,
        ssl_cert_reqs=None,  # Don't verify certificate
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    logger.info("Successfully connected to MongoDB Atlas")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise  # Re-raise the exception to prevent the app from starting with a bad DB connection

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Register blueprints
app.register_blueprint(assignments_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)

# Configure session
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.permanent_session_lifetime = timedelta(days=1)

# Set secret key from environment variable
app.secret_key = os.getenv('SECRET_KEY', Config.SECRET_KEY)

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.after_request
def after_request(response):
    # Handle CORS headers
    response.headers.update({
        'Access-Control-Allow-Origin': request.headers.get('Origin', '*'),
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    return response

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server status"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running'
    })

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(debug=True, port=5000, host='0.0.0.0')