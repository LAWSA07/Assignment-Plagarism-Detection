from mongoengine import Document, StringField, DateTimeField
import datetime

class Notification(Document):
    title = StringField(required=True)
    message = StringField(required=True)
    date = StringField(required=True)
    section = StringField(required=True)
    created_by = StringField(required=True)  # Professor's user id
    created_at = DateTimeField(default=datetime.datetime.utcnow) 