import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { register } from '../services/auth';
import './Register.css';

const Register = ({ userType = 'student' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        isStudent: userType === 'student'
      });
      navigate(userType === 'professor' ? '/professor/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-background-pattern"></div>
        <div className="auth-background-gradient"></div>
      </div>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">GS</div>
          <h2 className="logo-text">Grading System</h2>
        </div>

        <h1 className="auth-title">
          Create Account
        </h1>
        <p className="auth-subtitle">
          Join the {userType === 'professor' ? 'Professor' : 'Student'} Portal
        </p>

        <div className="auth-tabs">
          <Link 
            to="/login" 
            className={\`auth-tab \${location.pathname === '/login' ? 'active' : ''}\`}
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className={\`auth-tab \${location.pathname === '/register' ? 'active' : ''}\`}
          >
            Create Account
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="input"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="input"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button 
            type="submit" 
            className={\`button register-button \${isLoading ? 'loading' : ''}\`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="auth-switch">
            <Link to={userType === 'professor' ? '/login' : '/professor/register'}>
              Switch to {userType === 'professor' ? 'Student' : 'Professor'} Portal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 