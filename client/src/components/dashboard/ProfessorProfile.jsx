import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const ProfessorProfile = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        office_hours: '',
        office_location: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/professor/profile', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data);
            setEditForm({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                department: data.department || '',
                office_hours: data.office_hours || '',
                office_location: data.office_location || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

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
        setError('');

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

            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="loading">Loading profile...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={fetchProfile}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>Professor Profile</h2>
                {!isEditing && (
                    <button
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={editForm.first_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={editForm.last_name}
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
                        <label htmlFor="office_hours">Office Hours</label>
                        <textarea
                            id="office_hours"
                            name="office_hours"
                            value={editForm.office_hours}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="e.g., Mon: 10-12, Wed: 2-4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="office_location">Office Location</label>
                        <input
                            type="text"
                            id="office_location"
                            name="office_location"
                            value={editForm.office_location}
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
                                    first_name: profile.first_name || '',
                                    last_name: profile.last_name || '',
                                    email: profile.email || '',
                                    department: profile.department || '',
                                    office_hours: profile.office_hours || '',
                                    office_location: profile.office_location || ''
                                });
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="profile-details">
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Name:</span>
                                <span className="value">{profile.first_name} {profile.last_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Email:</span>
                                <span className="value">{profile.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Department:</span>
                                <span className="value">{profile.department || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Contact Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Office Hours:</span>
                                <span className="value">{profile.office_hours || 'Not specified'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Office Location:</span>
                                <span className="value">{profile.office_location || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Statistics</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Active Assignments:</span>
                                <span className="value">{profile.active_assignments || 0}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Total Students:</span>
                                <span className="value">{profile.total_students || 0}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Member Since:</span>
                                <span className="value">
                                    {new Date(profile.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessorProfile;