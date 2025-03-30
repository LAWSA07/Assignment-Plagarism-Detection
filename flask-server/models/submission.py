from mongoengine import Document, StringField, DateTimeField, ReferenceField, FloatField, FileField, DictField
from datetime import datetime
from .user import User
from .assignment import Assignment

class Submission(Document):
    student = ReferenceField(User, required=True)
    assignment = ReferenceField(Assignment, required=True)
    answer_file = FileField(required=True)  # Using FileField to store files in GridFS
    status = StringField(default='Submitted', choices=['Submitted', 'Processing', 'Graded', 'Late'])
    grade = FloatField()
    feedback = StringField()
    submitted_at = DateTimeField(default=datetime.utcnow)
    graded_at = DateTimeField()
    
    # New fields for OCR and plagiarism
    ocr_text = StringField()  # Extracted text from PDF
    plagiarism_score = FloatField()  # Overall plagiarism percentage
    plagiarism_details = DictField()  # Detailed plagiarism results
    processing_status = StringField(default='Pending', choices=['Pending', 'Processing', 'Completed', 'Failed'])
    processing_error = StringField()  # Store any errors during processing

    meta = {
        'collection': 'submissions',
        'indexes': [
            ('student', 'assignment'),
            'submitted_at',
            'status',
            'processing_status'
        ]
    }

    def to_json(self):
        return {
            "id": str(self.id),
            "student_id": str(self.student.id),
            "student_name": f"{self.student.first_name} {self.student.last_name}",
            "assignment_id": str(self.assignment.id),
            "assignment_name": self.assignment.name,
            "has_file": bool(self.answer_file),
            "status": self.status,
            "grade": self.grade,
            "feedback": self.feedback,
            "submitted_at": self.submitted_at.isoformat(),
            "graded_at": self.graded_at.isoformat() if self.graded_at else None,
            "plagiarism_score": self.plagiarism_score,
            "processing_status": self.processing_status,
            "processing_error": self.processing_error if self.processing_error else None
        } 