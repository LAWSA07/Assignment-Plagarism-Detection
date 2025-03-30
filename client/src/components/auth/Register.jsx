import React, { useState } from 'react';
import './Auth.css';

const Register = () => {
  const [isStudent, setIsStudent] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement registration logic
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isStudent ? 'Student Portal' : 'Professor Portal'}</h2>
        <p className="subtitle">Enter your credentials to access the system</p>

        <div className="auth-tabs">
          <button 
            className={`tab ${!isStudent ? 'active' : ''}`}
            onClick={() => setIsStudent(false)}
          >
            Login
          </button>
          <button 
            className={`tab ${isStudent ? 'active' : ''}`}
            onClick={() => setIsStudent(true)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>

        <button 
          className="switch-portal"
          onClick={() => setIsStudent(!isStudent)}
        >
          Switch to {isStudent ? 'Professor' : 'Student'} Registration
        </button>
      </div>
    </div>
  );
};

export default Register; 