import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../../services/auth';
import './Auth.css';
import './LoginTheme.css';
import '../LightTheme.css';

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
    <div className="theme-center" style={{ minHeight: '100vh', background: '#FAF6F2' }}>
      <div className="theme-card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <button
          className="theme-btn minimal-btn minimal-btn-cancel"
          style={{ marginBottom: 18, background: '#fff', color: '#1976D2', border: '1.5px solid #e3eafc', fontWeight: 700 }}
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#222', marginBottom: 8 }}>{isStudent ? 'Student Portal' : 'Professor Portal'}</h2>
        <p style={{ color: '#444', fontSize: '1.1rem', marginBottom: 24 }}>Enter your credentials to access the system</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <button className="theme-btn" style={{ background: isStudent ? '#FF914D' : '#fff', color: isStudent ? '#fff' : '#FF914D', border: isStudent ? 'none' : '2px solid #FF914D' }} onClick={() => setIsStudent(true)}>Student</button>
          <button className="theme-btn" style={{ background: !isStudent ? '#FF914D' : '#fff', color: !isStudent ? '#fff' : '#FF914D', border: !isStudent ? 'none' : '2px solid #FF914D' }} onClick={() => setIsStudent(false)}>Professor</button>
        </div>
        <form className="theme-center" style={{ width: '100%' }} onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="login-theme-group">
                <label htmlFor="firstName" className="login-theme-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="login-theme-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="login-theme-group">
                <label htmlFor="lastName" className="login-theme-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="login-theme-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your last name"
                />
              </div>
            </>
          )}

          <div className="login-theme-group">
            <label htmlFor="email" className="login-theme-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="login-theme-input"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          <div className="login-theme-group">
            <label htmlFor="password" className="login-theme-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="login-theme-input"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <>
              <div className="login-theme-group">
                <label htmlFor="confirmPassword" className="login-theme-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="login-theme-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Confirm your password"
                />
              </div>

              {isStudent && (
                <div className="login-theme-group">
                  <label htmlFor="section" className="login-theme-label">Section</label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    className="login-theme-input"
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
            className="theme-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: 24, color: '#444', fontSize: '1rem' }}>
          Don&apos;t have an account?{' '}
          <a href="/register" className="theme-link">Register</a>
        </div>
        {error && <div style={{ color: '#dc3545', marginTop: 16 }}>{error}</div>}
      </div>
    </div>
  );
};

export default Login;