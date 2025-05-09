from mongoengine import Document, StringField
 
class Book(Document):
    title = StringField(required=True)
    author = StringField(required=True)
    status = StringField(required=True, choices=['Available', 'Issued'], default='Available')
    isbn = StringField() 