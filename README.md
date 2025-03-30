# Assignment Management System

A web-based application for managing academic assignments, built with React and Flask.

## Features

- **User Authentication**: Separate login for students and professors
- **Professor Dashboard**: 
  - Create and manage assignments
  - Upload question files (PDF, DOC, DOCX)
  - View student submissions
- **Student Dashboard**:
  - View available assignments
  - Submit answers
  - Track submission status and grades
- **File Management**:
  - Secure file upload/download
  - Support for PDF, DOC, DOCX formats
  - File size limit: 10MB

## Tech Stack

### Frontend
- React.js
- Modern UI/UX design
- Responsive layout

### Backend
- Flask (Python)
- MongoDB with MongoEngine
- GridFS for file storage

## Setup

1. Clone the repository:
```bash
git clone https://github.com/LAWSA07/gdg_project.git
cd gdg_project
```

2. Install backend dependencies:
```bash
cd flask-server
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Start the backend server:
```bash
cd flask-server
python app.py
```

5. Start the frontend development server:
```bash
cd client
npm start
```

## Project Structure

```
gdg_project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── styles/        # CSS files
│   │   └── App.js         # Main App component
│   └── package.json
│
└── flask-server/          # Flask backend
    ├── models/            # Database models
    ├── routes/            # API routes
    ├── app.py            # Main Flask application
    └── requirements.txt   # Python dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 