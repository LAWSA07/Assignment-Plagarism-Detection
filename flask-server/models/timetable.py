from mongoengine import Document, StringField, FileField, DateTimeField
import datetime

class TimetablePDF(Document):
    section = StringField(required=True)
    uploaded_by = StringField(required=True)  # Professor's user id
    upload_date = DateTimeField(default=datetime.datetime.utcnow)
    pdf_file = FileField(required=True) 