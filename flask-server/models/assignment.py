from mongoengine import Document, StringField, DateTimeField, ReferenceField, FileField, BooleanField, ValidationError, ListField
from datetime import datetime
from .user import User

class Assignment(Document):
    name = StringField(required=True, min_length=3, max_length=100)
    course = StringField(required=True)
    description = StringField(required=True, min_length=10)
    due_date = DateTimeField(required=True)
    question_file = FileField(required=True)
    sections = ListField(StringField(), required=True)  # List of section IDs
    status = StringField(default='Active', choices=['Active', 'Archived'])
    professor = ReferenceField(User, required=True)  # Reference to the professor who created it
    created_at = DateTimeField(default=datetime.utcnow)
    is_active = BooleanField(default=True)

    meta = {
        'collection': 'assignments',
        'indexes': [
            'professor',
            'course',
            'due_date',
            'status'
        ]
    }

    def clean(self):
        """Validate the document before saving."""
        if self.name and len(self.name.strip()) < 3:
            raise ValidationError('Assignment name must be at least 3 characters long')
        
        if self.description and len(self.description.strip()) < 10:
            raise ValidationError('Description must be at least 10 characters long')
        
        if self.due_date and self.due_date < datetime.utcnow():
            raise ValidationError('Due date cannot be in the past')

        if not self.sections:
            raise ValidationError('At least one section must be selected')

    def to_json(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "course": self.course,
            "description": self.description,
            "due_date": self.due_date.isoformat(),
            "sections": self.sections,
            "has_file": bool(self.question_file),
            "status": self.status,
            "professor_id": str(self.professor.id),
            "professor_name": f"{self.professor.first_name} {self.professor.last_name}",
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active
        } 