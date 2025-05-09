import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    section: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/student/profile', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfile({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            email: data.profile.email || '',
            section: data.profile.section || '',
            profileImage: data.profile.profileImage ? `http://localhost:5000${data.profile.profileImage}` : '',
          });
          setImagePreview(data.profile.profileImage ? `http://localhost:5000${data.profile.profileImage}` : '');
          setError('');
        } else {
          setError(data.message || 'Failed to load profile');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const formData = new FormData();
    formData.append('firstName', profile.firstName);
    formData.append('lastName', profile.lastName);
    formData.append('email', profile.email);
    formData.append('section', profile.section);
    if (imageFile) {
      formData.append('profileImage', imageFile);
    }
    fetch('http://localhost:5000/api/student/profile/update', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess('Profile updated successfully!');
          setProfile(p => ({ ...p, profileImage: data.profile.profileImage ? `http://localhost:5000${data.profile.profileImage}` : '' }));
          setImageFile(null);
        } else {
          setError(data.message || 'Failed to update profile');
        }
      })
      .catch(() => setError('Failed to update profile'));
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  return (
    <div style={{ padding: 32, maxWidth: 480 }}>
      <h2 style={{ color: '#1976D2', fontWeight: 700 }}>Profile</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ color: '#1976D2', marginBottom: 16 }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <img
            src={imagePreview || profile.profileImage || 'https://ui-avatars.com/api/?name=Student&background=1976D2&color=fff&size=128'}
            alt="Profile"
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1976D2' }}
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>First Name</label>
          <input name="firstName" value={profile.firstName} onChange={handleChange} className="theme-input" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Last Name</label>
          <input name="lastName" value={profile.lastName} onChange={handleChange} className="theme-input" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input name="email" value={profile.email} onChange={handleChange} className="theme-input" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Section</label>
          <input name="section" value={profile.section} onChange={handleChange} className="theme-input" style={{ width: '100%' }} />
        </div>
        <button type="submit" className="theme-btn" style={{ background: '#1976D2', color: '#fff', width: '100%' }}>Save</button>
      </form>
    </div>
  );
} 