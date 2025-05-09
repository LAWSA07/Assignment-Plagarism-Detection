from flask import Blueprint, jsonify, session, request, send_file
from models.timetable import TimetablePDF
from decorators import login_required, professor_required, student_required
import io

timetable_bp = Blueprint('timetable', __name__)

@timetable_bp.route('/api/timetable', methods=['GET'])
@login_required
@student_required
def get_timetable():
    section = session.get('section')
    if not section:
        # Fallback: get section from user object
        from models.user import User
        user = User.objects.get(id=session['user_id'])
        section = user.section
    entries = TimetablePDF.objects(section=section)
    return jsonify([
        {
            'id': str(entry.id),
            'day': entry.day,
            'time': entry.time,
            'subject': entry.subject,
            'room': entry.room,
            'section': entry.section
        }
        for entry in entries
    ])

# Timetable PDF upload/download routes

@timetable_bp.route('/api/timetable/upload', methods=['POST'])
@login_required
@professor_required
def upload_timetable():
    section = request.form.get('section')
    file = request.files.get('pdf')
    if not section or not file:
        return jsonify({'error': 'Section and PDF file are required'}), 400
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    # Remove existing timetable for section
    TimetablePDF.objects(section=section).delete()
    timetable = TimetablePDF(
        section=section,
        uploaded_by=str(session['user_id']),
        pdf_file=file
    )
    timetable.save()
    return jsonify({'success': True, 'message': 'Timetable uploaded'})

@timetable_bp.route('/api/timetable/<section>', methods=['GET'])
@login_required
def get_timetable_pdf(section):
    timetable = TimetablePDF.objects(section=section).first()
    if not timetable or not timetable.pdf_file:
        return jsonify({'error': 'No timetable found for this section'}), 404
    return send_file(
        io.BytesIO(timetable.pdf_file.read()),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'timetable_{section}.pdf'
    )

@timetable_bp.route('/api/timetable/list', methods=['GET'])
@login_required
@professor_required
def list_timetables():
    timetables = TimetablePDF.objects()
    return jsonify([
        {
            'section': t.section,
            'uploaded_by': t.uploaded_by,
            'upload_date': t.upload_date.isoformat()
        } for t in timetables
    ])

@timetable_bp.route('/api/timetable/<section>', methods=['DELETE'])
@login_required
@professor_required
def delete_timetable(section):
    TimetablePDF.objects(section=section).delete()
    return jsonify({'success': True, 'message': 'Timetable deleted'}) 