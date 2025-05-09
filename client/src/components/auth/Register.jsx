import React, { useState } from 'react';
import { register } from '../../services/auth';
import './Auth.css';
import './LoginTheme.css';
import '../LightTheme.css';

const Register = () => {
  const [isStudent, setIsStudent] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    section: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        isStudent,
        section: isStudent ? formData.section : undefined
      });
      // Optionally redirect or show success
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-center" style={{ minHeight: '100vh', background: '#FAF6F2' }}>
      <div className="theme-card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#222', marginBottom: 8 }}>{isStudent ? 'Student Registration' : 'Professor Registration'}</h2>
        <p style={{ color: '#444', fontSize: '1.1rem', marginBottom: 24 }}>Create your account to get started</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <button className="theme-btn" style={{ background: isStudent ? '#FF914D' : '#fff', color: isStudent ? '#fff' : '#FF914D', border: isStudent ? 'none' : '2px solid #FF914D' }} onClick={() => setIsStudent(true)}>Student</button>
          <button className="theme-btn" style={{ background: !isStudent ? '#FF914D' : '#fff', color: !isStudent ? '#fff' : '#FF914D', border: !isStudent ? 'none' : '2px solid #FF914D' }} onClick={() => setIsStudent(false)}>Professor</button>
        </div>
        <form className="theme-center" style={{ width: '100%' }} onSubmit={handleSubmit}>
          <input className="theme-input" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input className="theme-input" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input className="theme-input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input className="theme-input" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input className="theme-input" type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          {isStudent && (
            <input className="theme-input" type="text" name="section" placeholder="Section" value={formData.section} onChange={handleChange} required />
          )}
          <button className="theme-btn" type="submit" style={{ width: '100%', marginTop: 12 }}>{isLoading ? 'Please wait...' : 'Register'}</button>
        </form>
        <div style={{ marginTop: 24, color: '#444', fontSize: '1rem' }}>
          Already have an account?{' '}
          <a href="/login" className="theme-link">Login</a>
        </div>
        {error && <div style={{ color: '#dc3545', marginTop: 16 }}>{error}</div>}
      </div>
    </div>
  );
};

export default Register;