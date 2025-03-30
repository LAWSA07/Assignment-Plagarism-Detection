import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import '../styles/auth.css';

const Login = ({ userType = 'student' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, userType === 'professor');
      navigate(userType === 'professor' ? '/professor/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {userType === 'professor' ? 'Professor Portal' : 'Student Portal'}
        </h1>
        <p className="auth-subtitle">
          Enter your credentials to access the system
        </p>

        <div className="auth-tabs">
          <Link 
            to="/login" 
            className="auth-tab active"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="auth-tab"
          >
            Register
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            Login
          </button>

          <button 
            type="button" 
            className="switch-button"
            onClick={() => navigate(userType === 'professor' ? '/login' : '/professor/login')}
          >
            Switch to {userType === 'professor' ? 'Student' : 'Professor'} Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 