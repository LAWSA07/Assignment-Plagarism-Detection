from flask import Blueprint, request, jsonify, current_app
from models.user import User
import logging

# Import decorators with error handling
try:
    from decorators import login_required, professor_required
except ImportError as e:
    logging.error(f"Failed to import decorators: {e}")
    def login_required(f): return f
    def professor_required(f): return f

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/professor/profile', methods=['GET'])
@login_required
@professor_required
def get_professor_profile():
    """Get the profile of the currently logged-in professor."""
    try:
        # Get the current user from the session
        current_user = User.objects.get(id=request.user_id)

        # Return the professor's profile data
        return jsonify({
            'success': True,
            'profile': {
                'firstName': current_user.first_name,
                'lastName': current_user.last_name,
                'email': current_user.email,
                'department': current_user.department,
                'officeHours': current_user.office_hours,
                'officeLocation': current_user.office_location
            }
        }), 200
    except Exception as e:
        logging.error(f"Error getting professor profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve professor profile'
        }), 500

@users_bp.route('/api/professor/profile/update', methods=['PUT'])
@login_required
@professor_required
def update_professor_profile():
    """Update the profile of the currently logged-in professor."""
    try:
        data = request.get_json()
        current_user = User.objects.get(id=request.user_id)

        # Update the user fields if they are provided in the request
        if 'firstName' in data:
            current_user.first_name = data['firstName']
        if 'lastName' in data:
            current_user.last_name = data['lastName']
        if 'email' in data:
            current_user.email = data['email']
        if 'department' in data:
            current_user.department = data['department']
        if 'officeHours' in data:
            current_user.office_hours = data['officeHours']
        if 'officeLocation' in data:
            current_user.office_location = data['officeLocation']

        # Save the updated user
        current_user.save()

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'profile': {
                'firstName': current_user.first_name,
                'lastName': current_user.last_name,
                'email': current_user.email,
                'department': current_user.department,
                'officeHours': current_user.office_hours,
                'officeLocation': current_user.office_location
            }
        }), 200
    except Exception as e:
        logging.error(f"Error updating professor profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to update professor profile'
        }), 500