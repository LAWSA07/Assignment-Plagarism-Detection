import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../services/auth';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [isStudent, setIsStudent] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    section: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear form data when switching between login and register
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: '',
      section: ''
    });
    setError('');
  }, [isLogin, isStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.email?.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (!isLogin) {
      if (!formData.firstName?.trim()) {
        setError('First name is required');
        return false;
      }
      if (!formData.lastName?.trim()) {
        setError('Last name is required');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (isStudent && !formData.section?.trim()) {
        setError('Section is required for students');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await login({
          email: formData.email.trim(),
          password: formData.password,
          isStudent: isStudent
        });

        // Check if user type matches the portal type
        if (isStudent && user.user_type === 'professor') {
          setError('Please use the professor portal to login as a professor.');
          return;
        } else if (!isStudent && user.user_type === 'student') {
          setError('Please use the student portal to login as a student.');
          return;
        }

        // Navigate based on user type
        if (user.user_type === 'professor') {
          navigate('/professor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        await register({
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          isStudent,
          section: isStudent ? formData.section.trim() : undefined
        });

        // Switch to login form after successful registration
        setIsLogin(true);
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          confirmPassword: '',
          section: ''
        });
        setError('Registration successful! Please login.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isStudent ? 'Student Portal' : 'Professor Portal'}</h2>
        <p className="subtitle">Enter your credentials to access the system</p>

        <div className="auth-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            type="button"
          >
            Register
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your last name"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Confirm your password"
                />
              </div>

              {isStudent && (
                <div className="form-group">
                  <label htmlFor="section">Section</label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your section"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          className="switch-portal-btn"
          onClick={() => {
            setIsStudent(!isStudent);
            setError('');
          }}
          type="button"
        >
          Switch to {isStudent ? 'Professor' : 'Student'} Portal
        </button>
      </div>
    </div>
  );
};

export default Login;