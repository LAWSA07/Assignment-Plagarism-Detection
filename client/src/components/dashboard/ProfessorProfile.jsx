import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/auth';
import './Dashboard.css';

const ProfessorProfile = () => {
    const navigate = useNavigate();
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
            const response = await api.get('/professor/profile');
            setProfile(response.data);
            setEditForm({
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                email: response.data.email || '',
                department: response.data.department || '',
                office_hours: response.data.office_hours || '',
                office_location: response.data.office_location || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setError('Failed to logout');
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
            const response = await api.put('/professor/profile/update', editForm);
            setProfile(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'Failed to update profile');
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

    if (!profile) {
        return <div>No profile data available</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Professor Profile</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <h2>Personal Information</h2>
                    <div className="profile-info">
                        <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Department:</strong> {profile.department}</p>
                        <p><strong>Position:</strong> {profile.position}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Contact Information</h2>
                    <div className="profile-info">
                        <p><strong>Office:</strong> {profile.office}</p>
                        <p><strong>Phone:</strong> {profile.phone}</p>
                        <p><strong>Office Hours:</strong> {profile.office_hours}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Teaching Information</h2>
                    <div className="profile-info">
                        <p><strong>Courses:</strong> {profile.courses.join(', ')}</p>
                        <p><strong>Research Areas:</strong> {profile.research_areas.join(', ')}</p>
                    </div>
                </div>
            </div>

            {!isEditing && (
                <button
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                >
                    Edit Profile
                </button>
            )}

            {isEditing && (
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
            )}
        </div>
    );
};

export default ProfessorProfile;