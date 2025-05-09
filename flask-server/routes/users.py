from flask import Blueprint, request, jsonify, current_app, session, send_file
from models.user import User
import logging
import io

# Import decorators with error handling
try:
    from decorators import login_required, professor_required
except ImportError as e:
    logging.error(f"Failed to import decorators: {e}")
    def login_required(f): return f
    def professor_required(f): return f

def student_required(f):
    def wrapper(*args, **kwargs):
        if 'user_type' not in session or session['user_type'] != 'student':
            return jsonify({'error': 'Student access required'}), 403
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/professor/profile', methods=['GET'])
@login_required
@professor_required
def get_professor_profile():
    """Get the profile of the currently logged-in professor."""
    try:
        current_user = User.objects.get(id=session['user_id'])
        image_url = None
        if current_user.profile_image:
            image_url = f"/api/professor/profile/image"
        return jsonify({
            'success': True,
            'profile': {
                'firstName': current_user.first_name,
                'lastName': current_user.last_name,
                'email': current_user.email,
                'department': current_user.department,
                'officeHours': current_user.office_hours,
                'officeLocation': current_user.office_location,
                'profileImage': image_url
            }
        }), 200
    except Exception as e:
        logging.error(f"Error getting professor profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve professor profile'
        }), 500

@users_bp.route('/api/professor/profile/update', methods=['PUT', 'POST'])
@login_required
@professor_required
def update_professor_profile():
    """Update the profile of the currently logged-in professor."""
    try:
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.form
            file = request.files.get('profileImage')
        else:
            data = request.get_json()
            file = None
        current_user = User.objects.get(id=session['user_id'])
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
        if file:
            current_user.profile_image.replace(file, content_type=file.content_type)
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
                'officeLocation': current_user.office_location,
                'profileImage': "/api/professor/profile/image" if current_user.profile_image else None
            }
        }), 200
    except Exception as e:
        logging.error(f"Error updating professor profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to update professor profile'
        }), 500

@users_bp.route('/api/professor/profile/image', methods=['GET'])
@login_required
@professor_required
def get_professor_profile_image():
    try:
        current_user = User.objects.get(id=session['user_id'])
        if not current_user.profile_image:
            return jsonify({'error': 'No profile image'}), 404
        return send_file(
            io.BytesIO(current_user.profile_image.read()),
            mimetype=current_user.profile_image.content_type or 'image/jpeg',
            as_attachment=False,
            download_name='profile.jpg'
        )
    except Exception as e:
        logging.error(f"Error getting professor profile image: {str(e)}")
        return jsonify({'error': 'Failed to get profile image'}), 500

@users_bp.route('/api/student/profile', methods=['GET'])
@login_required
@student_required
def get_student_profile():
    try:
        current_user = User.objects.get(id=session['user_id'])
        image_url = None
        if current_user.profile_image:
            image_url = f"/api/student/profile/image"
        return jsonify({
            'success': True,
            'profile': {
                'firstName': current_user.first_name,
                'lastName': current_user.last_name,
                'email': current_user.email,
                'section': current_user.section,
                'profileImage': image_url
            }
        }), 200
    except Exception as e:
        logging.error(f"Error getting student profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve student profile'
        }), 500

@users_bp.route('/api/student/profile/update', methods=['PUT', 'POST'])
@login_required
@student_required
def update_student_profile():
    try:
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.form
            file = request.files.get('profileImage')
        else:
            data = request.get_json()
            file = None
        current_user = User.objects.get(id=session['user_id'])
        if 'firstName' in data:
            current_user.first_name = data['firstName']
        if 'lastName' in data:
            current_user.last_name = data['lastName']
        if 'email' in data:
            current_user.email = data['email']
        if 'section' in data:
            current_user.section = data['section']
        if file:
            current_user.profile_image.replace(file, content_type=file.content_type)
        current_user.save()
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'profile': {
                'firstName': current_user.first_name,
                'lastName': current_user.last_name,
                'email': current_user.email,
                'section': current_user.section,
                'profileImage': "/api/student/profile/image" if current_user.profile_image else None
            }
        }), 200
    except Exception as e:
        logging.error(f"Error updating student profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to update student profile'
        }), 500

@users_bp.route('/api/student/profile/image', methods=['GET'])
@login_required
@student_required
def get_student_profile_image():
    try:
        current_user = User.objects.get(id=session['user_id'])
        if not current_user.profile_image:
            return jsonify({'error': 'No profile image'}), 404
        return send_file(
            io.BytesIO(current_user.profile_image.read()),
            mimetype=current_user.profile_image.content_type or 'image/jpeg',
            as_attachment=False,
            download_name='profile.jpg'
        )
    except Exception as e:
        logging.error(f"Error getting student profile image: {str(e)}")
        return jsonify({'error': 'Failed to get profile image'}), 500