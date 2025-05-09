import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProfessorDashboard from './components/dashboard/ProfessorDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import HomePage from './components/HomePage';
import FeaturesPage from './components/FeaturesPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PlannerBoard from './components/PlannerBoard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/professor/*" element={<ProfessorDashboard />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/planner" element={<PlannerBoard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
