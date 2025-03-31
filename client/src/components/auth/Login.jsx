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
    setError(null);
    setIsLoading(true);

    try {
      console.log('Login attempt with:', { email: formData.email, password: formData.password, isStudent });
      const response = await login(formData.email, formData.password, isStudent);

      if (response.success) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.user));

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-toast';
        successMessage.textContent = 'Login successful! Redirecting...';
        document.body.appendChild(successMessage);

        // Remove success message after 2 seconds
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 2000);

        // Redirect based on user type
        setTimeout(() => {
          if (response.user.user_type === 'student') {
            navigate('/student/dashboard');
          } else {
            navigate('/professor/dashboard');
          }
        }, 1000);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Login failed. Please try again.');

      // Show error toast
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-toast';
      errorMessage.textContent = error.message || 'Login failed. Please try again.';
      document.body.appendChild(errorMessage);

      // Remove error message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 3000);
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