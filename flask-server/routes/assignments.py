from flask import Blueprint, request, jsonify, session, send_file, current_app
from werkzeug.utils import secure_filename
from models.user import User
from models.assignment import Assignment
from models.submission import Submission
from utils.document_processor import document_processor
import os
import uuid
import datetime
import logging
from functools import wraps
import io
from mongoengine.errors import ValidationError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

assignments_bp = Blueprint('assignments', __name__)

# File upload configuration
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Not logged in'}), 401
        return f(*args, **kwargs)
    return decorated_function

def professor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_type') != 'professor':
            return jsonify({'error': 'Only professors can access this endpoint'}), 403
        return f(*args, **kwargs)
    return decorated_function

def student_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_type') != 'student':
            return jsonify({'error': 'Only students can access this endpoint'}), 403
        return f(*args, **kwargs)
    return decorated_function

def validate_file(file):
    """Validate file upload."""
    if not file:
        return None, 'No file provided'
    
    if not file.filename:
        return None, 'No filename provided'
    
    if not allowed_file(file.filename):
        return None, f'Invalid file type. Allowed types are: {", ".join(ALLOWED_EXTENSIONS)}'
    
    # Check file size (10MB limit)
    file.seek(0, 2)  # Seek to end of file
    size = file.tell()  # Get current position (file size)
    file.seek(0)  # Reset file position
    
    if size > MAX_FILE_SIZE:
        return None, 'File size exceeds 10MB limit'
    
    # Check if file is empty
    if size == 0:
        return None, 'File is empty'
    
    # Check content type
    content_type = file.content_type
    if content_type not in ['application/pdf']:
        return None, 'Only PDF files are allowed'
    
    return file, None

@assignments_bp.route('/api/student/assignments', methods=['GET'])
@login_required
@student_required
def get_student_assignments():
    try:
        user = User.objects(id=session['user_id']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get all active assignments
        assignments = Assignment.objects(is_active=True)
        
        # Get submissions for this student
        submissions = Submission.objects(student=user)
        submission_map = {str(sub.assignment.id): sub for sub in submissions}

        assignment_list = []
        for assignment in assignments:
            assignment_data = assignment.to_json()
            submission = submission_map.get(str(assignment.id))
            assignment_data.update({
                'status': submission.status if submission else 'Not Started',
                'grade': submission.grade if submission else None,
                'submitted_at': submission.submitted_at.isoformat() if submission and submission.submitted_at else None
            })
            assignment_list.append(assignment_data)

        return jsonify(assignment_list)

    except Exception as e:
        logger.error(f"Error fetching student assignments: {str(e)}")
        return jsonify({'error': 'Failed to fetch assignments'}), 500

@assignments_bp.route('/api/professor/assignments', methods=['GET'])
@login_required
@professor_required
def get_professor_assignments():
    try:
        user = User.objects(id=session['user_id']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        assignments = Assignment.objects(professor=user, is_active=True)
        return jsonify([assignment.to_json() for assignment in assignments])

    except Exception as e:
        logger.error(f"Error fetching professor assignments: {str(e)}")
        return jsonify({'error': 'Failed to fetch assignments'}), 500

@assignments_bp.route('/api/assignments/create', methods=['POST'])
@login_required
@professor_required
def create_assignment():
    try:
        logger.info("Starting assignment creation...")
        
        # Log all form data
        logger.info(f"Form data: {request.form}")
        logger.info(f"Files: {request.files}")
        
        # Get form data
        name = request.form.get('name')
        course = request.form.get('course')
        description = request.form.get('description')
        due_date = request.form.get('due_date')
        sections = request.form.getlist('sections[]')
        
        # Log received data
        logger.info(f"Received data: name={name}, course={course}, description={description}, due_date={due_date}, sections={sections}")
        
        # Validate required fields
        if not all([name, course, description, due_date]):
            missing_fields = [field for field, value in {
                'name': name,
                'course': course,
                'description': description,
                'due_date': due_date
            }.items() if not value]
            logger.error(f"Missing required fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        if not sections:
            logger.error("No sections provided")
            return jsonify({'error': 'At least one section must be selected'}), 400

        # Validate and parse due date
        try:
            logger.info(f"Parsing due date: {due_date}")
            due_date = datetime.datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except ValueError as e:
            logger.error(f"Date parsing error: {str(e)}")
            return jsonify({'error': 'Invalid due date format. Please use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400

        # Get and validate the file
        if 'question_file' not in request.files:
            logger.error("No file uploaded")
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['question_file']
        logger.info(f"Received file: {file.filename}, type: {file.content_type}, size: {file.content_length if hasattr(file, 'content_length') else 'unknown'}")
        
        file_validation_result, error_message = validate_file(file)
        if error_message:
            logger.error(f"File validation error: {error_message}")
            return jsonify({'error': error_message}), 400

        # Get current user
        try:
            current_user = User.objects.get(id=session['user_id'])
            logger.info(f"Found professor: {current_user.email}")
        except Exception as e:
            logger.error(f"Error getting current user: {str(e)}")
            return jsonify({'error': 'Could not verify professor account'}), 401
        
        # Create new assignment
        try:
            logger.info("Creating new assignment...")
            new_assignment = Assignment(
                name=name,
                course=course,
                description=description,
                due_date=due_date,
                sections=sections,
                professor=current_user
            )
            
            # Save the file
            logger.info("Saving file...")
            new_assignment.question_file.put(
                file_validation_result,
                filename=secure_filename(file.filename),
                content_type=file.content_type
            )
            
            # Validate and save the assignment
            logger.info("Validating assignment...")
            new_assignment.validate()  # This will run the clean method
            
            logger.info("Saving assignment...")
            new_assignment.save()
            
            logger.info(f"Assignment created successfully with ID: {new_assignment.id}")
            return jsonify(new_assignment.to_json()), 201

        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return jsonify({'error': str(e)}), 400
            
    except Exception as e:
        logger.error(f"Error creating assignment: {str(e)}", exc_info=True)  # Added exc_info for stack trace
        return jsonify({'error': 'Internal server error occurred while creating assignment'}), 500

@assignments_bp.route('/api/assignments/submit/<assignment_id>', methods=['POST'])
@login_required
@student_required
def submit_assignment(assignment_id):
    try:
        # Get student and assignment
        student = User.objects(id=session['user_id']).first()
        assignment = Assignment.objects(id=assignment_id).first()

        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        if not student:
            return jsonify({'error': 'Student not found'}), 404

        # Handle answer file upload
        if 'answerFile' not in request.files:
            return jsonify({'error': 'No answer file provided'}), 400

        file, error = validate_file(request.files['answerFile'])
        if error:
            return jsonify({'error': error}), 400

        # Check if submission already exists
        submission = Submission.objects(student=student, assignment=assignment).first()
        if submission:
            # Update existing submission
            try:
                filename = secure_filename(file.filename)
                submission.answer_file.replace(
                    file,
                    filename=filename,
                    content_type=file.content_type
                )
                submission.submitted_at = datetime.datetime.utcnow()
                submission.status = 'Submitted'
                submission.processing_status = 'Pending'  # Reset processing status
                submission.ocr_text = None  # Clear previous OCR text
                submission.plagiarism_score = None  # Clear previous plagiarism score
                submission.plagiarism_details = None  # Clear previous details
                submission.processing_error = None  # Clear any previous errors
                submission.save()
            except Exception as e:
                logger.error(f"Error updating submission file: {str(e)}")
                return jsonify({'error': 'Failed to update submission file'}), 500
        else:
            # Create new submission
            try:
                submission = Submission(
                    student=student,
                    assignment=assignment,
                    status='Submitted',
                    processing_status='Pending'
                )
                filename = secure_filename(file.filename)
                submission.answer_file.put(
                    file,
                    filename=filename,
                    content_type=file.content_type
                )
                submission.save()
            except Exception as e:
                logger.error(f"Error creating submission: {str(e)}")
                return jsonify({'error': 'Failed to create submission'}), 500

        # Start asynchronous processing
        try:
            document_processor.process_submission_async(submission.id)
            logger.info(f"Started processing for submission {submission.id}")
        except Exception as e:
            logger.error(f"Error starting document processing: {str(e)}")
            # Don't return an error here, as the submission was successful
            # The processing status will indicate any issues

        return jsonify({
            **submission.to_json(),
            "message": "Assignment submitted successfully. Processing started."
        }), 201

    except Exception as e:
        logger.error(f"Error submitting assignment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/api/assignments/<assignment_id>/download', methods=['GET'])
@login_required
def download_assignment(assignment_id):
    try:
        logger.info(f"Attempting to download assignment {assignment_id}")
        
        # Validate assignment ID
        if not assignment_id:
            logger.error("No assignment ID provided")
            return jsonify({'error': 'Assignment ID is required'}), 400

        # Find the assignment
        assignment = Assignment.objects(id=assignment_id).first()
        if not assignment:
            logger.error(f"Assignment {assignment_id} not found")
            return jsonify({'error': 'Assignment not found'}), 404

        # Check if assignment has a question file
        if not assignment.question_file:
            logger.error(f"No question file found for assignment {assignment_id}")
            return jsonify({'error': 'Assignment file not found'}), 404

        try:
            # Get the file from GridFS
            file_data = assignment.question_file.read()
            if not file_data:
                logger.error(f"Empty file data for assignment {assignment_id}")
                return jsonify({'error': 'Assignment file is empty'}), 404

            # Get file metadata
            content_type = assignment.question_file.content_type or 'application/pdf'
            filename = assignment.question_file.filename or f"{assignment.name}.pdf"
            
            logger.info(f"Successfully retrieved file for assignment {assignment_id}")
            logger.info(f"File details - Name: {filename}, Type: {content_type}, Size: {len(file_data)} bytes")

            # Create file stream
            file_stream = io.BytesIO(file_data)
            
            return send_file(
                file_stream,
                mimetype=content_type,
                as_attachment=True,
                download_name=filename
            )

        except Exception as e:
            logger.error(f"Error reading file from GridFS: {str(e)}")
            return jsonify({'error': 'Error reading assignment file'}), 500

    except Exception as e:
        logger.error(f"Error downloading assignment: {str(e)}")
        return jsonify({'error': 'Failed to download assignment'}), 500

@assignments_bp.route('/api/submissions/<submission_id>/status', methods=['GET'])
@login_required
def check_submission_status(submission_id):
    try:
        # Get the submission
        submission = Submission.objects(id=submission_id).first()
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404

        # Check if user has permission to view this submission
        user_id = session['user_id']
        user_type = session.get('user_type')
        
        if user_type == 'student' and str(submission.student.id) != user_id:
            return jsonify({'error': 'Not authorized to view this submission'}), 403
        elif user_type == 'professor' and str(submission.assignment.professor.id) != user_id:
            return jsonify({'error': 'Not authorized to view this submission'}), 403

        # Return submission status and results
        return jsonify({
            'id': str(submission.id),
            'processing_status': submission.processing_status,
            'processing_error': submission.processing_error,
            'plagiarism_score': submission.plagiarism_score,
            'plagiarism_details': submission.plagiarism_details
        })

    except Exception as e:
        logger.error(f"Error checking submission status: {str(e)}")
        return jsonify({'error': 'Failed to check submission status'}), 500

@assignments_bp.route('/api/assignments/<assignment_id>/submissions', methods=['GET'])
def get_assignment_submissions(assignment_id):
    try:
        # Verify user is logged in
        if not session.get('user_id'):
            return jsonify({'error': 'Not authenticated'}), 401
        
        current_user = User.objects.get(id=session['user_id'])
        assignment = Assignment.objects.get(id=assignment_id)

        # For professors: return all submissions for their assignment
        if current_user.user_type == 'professor':
            if str(assignment.professor.id) != str(current_user.id):
                return jsonify({'error': 'Not authorized'}), 403
            
            submissions = Submission.objects(assignment=assignment)
            return jsonify([sub.to_json() for sub in submissions]), 200

        # For students: return only their own submissions
        elif current_user.user_type == 'student':
            if current_user.section not in assignment.sections:
                return jsonify({'error': 'Not authorized'}), 403
            
            submissions = Submission.objects(
                assignment=assignment,
                student=current_user
            )
            return jsonify([sub.to_json() for sub in submissions]), 200

    except DoesNotExist:
        return jsonify({'error': 'Assignment not found'}), 404
    except Exception as e:
        print(f"Error fetching submissions: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 