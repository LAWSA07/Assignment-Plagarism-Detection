from flask import Blueprint, jsonify, session, request
from models.notification import Notification
from decorators import login_required, student_required, professor_required
import datetime

notifications_bp = Blueprint('notifications', __name__)

# Student: view notifications for their section
@notifications_bp.route('/api/notifications', methods=['GET'])
@login_required
@student_required
def get_notifications():
    section = session.get('section')
    if not section:
        from models.user import User
        user = User.objects.get(id=session['user_id'])
        section = user.section
    notifications = Notification.objects(section=section)
    return jsonify([
        {
            'id': str(n.id),
            'title': n.title,
            'message': n.message,
            'date': n.date,
            'section': n.section
        }
        for n in notifications
    ])

# Professor: create a notification
@notifications_bp.route('/api/notifications', methods=['POST'])
@login_required
@professor_required
def create_notification():
    data = request.get_json()
    title = data.get('title')
    message = data.get('message')
    section = data.get('section')
    if not title or not message or not section:
        return jsonify({'error': 'Title, message, and section are required'}), 400
    notification = Notification(
        title=title,
        message=message,
        date=datetime.datetime.utcnow().strftime('%Y-%m-%d'),
        section=section,
        created_by=str(session['user_id'])
    )
    notification.save()
    return jsonify({'success': True, 'message': 'Notification created'})

# Professor: list notifications created by this professor
@notifications_bp.route('/api/notifications/professor', methods=['GET'])
@login_required
@professor_required
def list_professor_notifications():
    notifications = Notification.objects(created_by=str(session['user_id']))
    return jsonify([
        {
            'id': str(n.id),
            'title': n.title,
            'message': n.message,
            'date': n.date,
            'section': n.section,
            'created_at': n.created_at.isoformat()
        }
        for n in notifications
    ])

# Professor: delete a notification
@notifications_bp.route('/api/notifications/<id>', methods=['DELETE'])
@login_required
@professor_required
def delete_notification(id):
    Notification.objects(id=id, created_by=str(session['user_id'])).delete()
    return jsonify({'success': True, 'message': 'Notification deleted'}) 