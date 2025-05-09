import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaUserCircle, FaEnvelope, FaBuilding, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const ProfessorProfile = ({ profile, setProfile, loading, error, fetchProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        officeHours: '',
        officeLocation: ''
    });
    const [localError, setLocalError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setEditForm({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                department: profile.department || '',
                officeHours: profile.officeHours || '',
                officeLocation: profile.officeLocation || ''
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setLocalError('');

        try {
            const response = await fetch('http://localhost:5000/api/professor/profile/update', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const updatedData = await response.json();
            if (!updatedData.success || !updatedData.profile) throw new Error('Failed to update profile');
            setProfile(updatedData.profile);
            setIsEditing(false);
            if (fetchProfile) fetchProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            setLocalError(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Simulated quick stats (replace with real data if available)
    const stats = [
        { label: 'Assignments', value: profile?.assignmentsCount || 0 },
        { label: 'Students', value: profile?.studentsCount || 0 },
    ];

    // Loading skeleton
    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                        <div className="profile-avatar-skeleton" style={{ width: 64, height: 64, borderRadius: '50%', background: '#e3eafc', marginRight: 24 }} />
                        <div>
                            <div className="skeleton" style={{ width: 120, height: 24, background: '#e3eafc', borderRadius: 8, marginBottom: 8 }} />
                            <div className="skeleton" style={{ width: 80, height: 16, background: '#e3eafc', borderRadius: 8 }} />
                        </div>
                    </div>
                </div>
                <div className="card" style={{ minHeight: 180 }}>
                    <div className="skeleton" style={{ width: '100%', height: 24, background: '#e3eafc', borderRadius: 8, marginBottom: 16 }} />
                    <div className="skeleton" style={{ width: '100%', height: 24, background: '#e3eafc', borderRadius: 8, marginBottom: 16 }} />
                    <div className="skeleton" style={{ width: '100%', height: 24, background: '#e3eafc', borderRadius: 8 }} />
                </div>
            </div>
        );
    }

    if (error || localError) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error || localError}</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {/* Profile Avatar */}
                    {profile?.profileImage ? (
                        <img src={profile.profileImage} alt="Profile" className="profile-avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976D2' }} />
                    ) : (
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e3eafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#1976D2', border: '2px solid #1976D2' }}>
                            <FaUserCircle />
                        </div>
                    )}
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '2rem', color: '#1976D2' }}>{profile.firstName} {profile.lastName}</h2>
                        <div style={{ color: '#888', fontWeight: 500, fontSize: '1.1rem' }}>Professor</div>
                    </div>
                </div>
                {!isEditing && (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>
            {/* Quick Stats */}
            <div className="stats-container" style={{ marginBottom: 32 }}>
                {stats.map(stat => (
                    <div className="stat-card" key={stat.label}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-number">{stat.value}</div>
                    </div>
                ))}
            </div>
            {/* Info Card */}
            <div className="card">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={editForm.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={editForm.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="department">Department</label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                value={editForm.department}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="officeHours">Office Hours</label>
                            <textarea
                                id="officeHours"
                                name="officeHours"
                                value={editForm.officeHours}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="e.g., Mon: 10-12, Wed: 2-4"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="officeLocation">Office Location</label>
                            <input
                                type="text"
                                id="officeLocation"
                                name="officeLocation"
                                value={editForm.officeLocation}
                                onChange={handleInputChange}
                                placeholder="e.g., Building A, Room 123"
                            />
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditForm({
                                        firstName: profile.firstName || '',
                                        lastName: profile.lastName || '',
                                        email: profile.email || '',
                                        department: profile.department || '',
                                        officeHours: profile.officeHours || '',
                                        officeLocation: profile.officeLocation || ''
                                    });
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="save-btn" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="info-grid">
                        <div className="info-item"><FaEnvelope className="label" /> <span className="label">Email:</span> <span className="value">{profile.email}</span></div>
                        <div className="info-item"><FaBuilding className="label" /> <span className="label">Department:</span> <span className="value">{profile.department}</span></div>
                        <div className="info-item"><FaClock className="label" /> <span className="label">Office Hours:</span> <span className="value">{profile.officeHours}</span></div>
                        <div className="info-item"><FaMapMarkerAlt className="label" /> <span className="label">Office Location:</span> <span className="value">{profile.officeLocation}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfessorProfile;