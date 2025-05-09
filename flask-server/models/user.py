from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField, ListField, FileField
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(Document):
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    user_type = StringField(required=True, choices=['student', 'professor'])
    section = StringField(required=False)  # Required only for students
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()
    is_professor = BooleanField(default=False)
    
    # Professor-specific fields
    department = StringField(required=False)
    office_hours = StringField(required=False)
    office_location = StringField(required=False)

    profile_image = FileField(required=False)

    meta = {
        'collection': 'users',
        'indexes': [
            'email',
            ('user_type', 'section'),  # Compound index for efficient querying
            'is_professor'
        ]
    }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def clean(self):
        # Make section required for students
        if self.user_type == 'student' and not self.section:
            raise ValidationError('Section is required for students')

    def to_json(self):
        user_dict = {
            'id': str(self.id),
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'user_type': self.user_type,
            'isProfessor': self.is_professor,
            'createdAt': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        # Include section for students
        if not self.is_professor and self.section:
            user_dict['section'] = self.section
            
        # Include professor-specific fields
        if self.is_professor:
            user_dict.update({
                'department': self.department or '',
                'officeHours': self.office_hours or '',
                'officeLocation': self.office_location or ''
            })
        
        return user_dict 