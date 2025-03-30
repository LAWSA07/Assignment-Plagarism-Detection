from functools import wraps
from flask import request, jsonify
from utils.db_utils import verify_session

def token_required(f):
    """Decorator to require valid token for routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
            
        token = auth_header.replace('Bearer ', '')
        user = verify_session(token)
        
        if not user:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user to request context
        request.user = user
        return f(*args, **kwargs)
    
    return decorated

def role_required(allowed_roles):
    """Decorator to require specific user roles."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.user['user_type'] not in allowed_roles:
                return jsonify({'error': 'Unauthorized access'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def student_required(f):
    """Decorator to require student role."""
    return role_required(['student'])(f)

def professor_required(f):
    """Decorator to require professor role."""
    return role_required(['professor'])(f) 