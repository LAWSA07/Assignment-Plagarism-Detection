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

## Deployment Instructions

### Frontend (Vercel)

1. Sign up for a [Vercel](https://vercel.com) account
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Navigate to the client directory:
   ```bash
   cd client
   ```
4. Deploy to Vercel:
   ```bash
   vercel
   ```
5. Set environment variables in the Vercel dashboard:
   - `REACT_APP_API_URL` - URL of your backend API (e.g., https://your-api.render.com/api)

### Backend (Render)

1. Sign up for a [Render](https://render.com) account
2. Create a new Web Service
3. Connect your repository
4. Configure the service:
   - **Build Command**: `pip install -r flask-server/requirements.txt`
   - **Start Command**: `cd flask-server && gunicorn -c gunicorn.conf.py app:app`
   - **Environment Variables**:
     - `FLASK_ENV` = production
     - `SECRET_KEY` = [your-secure-secret-key]
     - `MONGODB_URI` = [your-mongodb-connection-string]
     - `ALLOWED_ORIGINS` = [your-frontend-domain]
     - `FRONTEND_DOMAIN` = [your-frontend-domain]

5. The backend is currently deployed at:
   - [https://assignment-plagarism-detection.onrender.com](https://assignment-plagarism-detection.onrender.com)

6. Note about version conflicts:
   - If you encounter dependency conflicts during deployment, you might need to adjust your requirements.txt file.
   - The current configuration requires Flask 2.2.0 or higher to be compatible with Flask-Session 0.5.0

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
FLASK_ENV=development
SECRET_KEY=your-dev-secret-key
MONGODB_URI=mongodb://localhost:27017/assignment_checker
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Additional Configuration

1. Update the API domain in `client/vercel.json` to point to the Render URL: `https://assignment-plagarism-detection.onrender.com/api`
2. Update the frontend domain in `flask-server/app.py` once you have your Vercel domain

## Post-Deployment Verification

After deploying both frontend and backend:

1. Verify API connectivity
2. Test authentication flow
3. Test file uploads and downloads
4. Check CORS configuration by monitoring network requests