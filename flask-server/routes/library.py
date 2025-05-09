from flask import Blueprint, jsonify
from models.library import Book
from decorators import login_required

library_bp = Blueprint('library', __name__)

@library_bp.route('/api/library/books', methods=['GET'])
@login_required
def get_books():
    books = Book.objects()
    return jsonify([
        {
            'id': str(book.id),
            'title': book.title,
            'author': book.author,
            'status': book.status,
            'isbn': book.isbn
        }
        for book in books
    ]) 