import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import {
    verifySession,
    fetchStudentAssignments,
    downloadAssignment,
    logout
} from '../../services/dashboard';
import './Dashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assignments');
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [downloadingAssignment, setDownloadingAssignment] = useState(null);
    const [filters, setFilters] = useState({
        status: 'All Statuses',
        course: 'All Courses'
    });

    useEffect(() => {
        verifyAndLoadData();
    }, [navigate]);

    const verifyAndLoadData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                console.log('No user found, redirecting to login');
                navigate('/login');
                return;
            }

            // Check if user is a student
            if (user.user_type !== 'student') {
                console.log('User is not a student, redirecting to professor dashboard');
                navigate('/professor/dashboard');
                return;
            }

            const sessionData = await verifySession();
            if (sessionData.user_type !== 'student') {
                console.log('User is not a student, redirecting to professor dashboard');
                navigate('/professor/dashboard');
                return;
            }

            await loadAssignments();
        } catch (error) {
            console.error('Session verification error:', error);
            setError('Failed to verify session. Please try logging in again.');
            localStorage.removeItem('user');
            navigate('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAssignments = async () => {
        try {
            const data = await fetchStudentAssignments();
            console.log('Assignments fetched:', data);
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to fetch assignments');
        }
    };

    const handleDownload = async (assignment) => {
        if (!assignment || !assignment.id) {
            console.error('Invalid assignment data:', assignment);
            alert('Cannot download this assignment. Invalid assignment data.');
            return;
        }

        try {
            setDownloadingAssignment(assignment.id);
            console.log('Downloading assignment:', assignment.id);

            const blob = await downloadAssignment(assignment.id);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${assignment.name || 'assignment'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading assignment:', error);
            alert(error.message || 'Failed to download assignment file. Please try again later.');
        } finally {
            setDownloadingAssignment(null);
        }
    };

    const handleSubmit = (assignment) => {
        if (!assignment || !assignment.id) {
            console.error('Invalid assignment data:', assignment);
            alert('Cannot submit this assignment. Invalid assignment data.');
            return;
        }
        setSelectedAssignment(assignment);
        setIsSubmitModalOpen(true);
    };

    const handleSubmissionComplete = (submission) => {
        setAssignments(assignments.map(assignment =>
            assignment.id === submission.assignment_id
                ? { ...assignment, status: 'Submitted', progress: 100 }
                : assignment
        ));
        setIsSubmitModalOpen(false);
        setSelectedAssignment(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Failed to logout. Please try again.');
        }
    };

    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const filteredAssignments = assignments.filter(assignment => {
        if (filters.status !== 'All Statuses' && assignment.status !== filters.status) {
            return false;
        }
        if (filters.course !== 'All Courses' && assignment.course !== filters.course) {
            return false;
        }
        return true;
    });

    const stats = {
        pendingAssignments: assignments.filter(a => !a.status || a.status === 'Active').length,
        completedAssignments: assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length,
        averageScore: assignments.length > 0
            ? Math.round(assignments.reduce((acc, curr) => acc + (curr.score || 0), 0) / assignments.length) + '%'
            : 'N/A'
    };

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/login')}>Return to Login</button>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ color: '#333' }}>
            <div className="dashboard-header" style={{ background: '#f5f5f5', padding: '20px', borderBottom: '1px solid #ddd' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>Student Dashboard</h1>
                <button className="logout-btn" style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }} onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="stats-container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                padding: '20px'
            }}>
                <div className="stat-card" style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Pending Assignments</h3>
                    <p className="stat-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                        {stats.pendingAssignments}
                    </p>
                    <p className="stat-label" style={{ color: '#7f8c8d' }}>Due this week</p>
                </div>

                <div className="stat-card" style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Completed Assignments</h3>
                    <p className="stat-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                        {stats.completedAssignments}
                    </p>
                    <p className="stat-label" style={{ color: '#7f8c8d' }}>This semester</p>
                </div>

                <div className="stat-card" style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Average Score</h3>
                    <p className="stat-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                        {stats.averageScore}
                    </p>
                    <p className="stat-label" style={{ color: '#7f8c8d' }}>All assignments</p>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignments')}
                >
                    Assignments
                </button>
                <button
                    className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submit')}
                >
                    Submit
                </button>
                <button
                    className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feedback')}
                >
                    Feedback
                </button>
            </div>

            <div className="content-section">
                <div className="section-header">
                    <h2>My Assignments</h2>
                    <div className="filters">
                        <select
                            className="filter-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option>All Statuses</option>
                            <option>Not Started</option>
                            <option>In Progress</option>
                            <option>Submitted</option>
                            <option>Graded</option>
                        </select>
                        <select
                            className="filter-select"
                            value={filters.course}
                            onChange={(e) => handleFilterChange('course', e.target.value)}
                        >
                            <option>All Courses</option>
                            <option>CS101</option>
                            <option>CS201</option>
                            <option>CS301</option>
                            <option>CS401</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>Loading assignments...</p>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="no-assignments">
                        {assignments.length === 0
                            ? 'No assignments available at the moment.'
                            : 'No assignments match the selected filters.'}
                    </div>
                ) : (
                    <div className="assignments-table" style={{ margin: '20px', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                        <div className="table-header" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            padding: '15px',
                            backgroundColor: '#34495e',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            <div className="col">Assignment</div>
                            <div className="col">Course</div>
                            <div className="col">Due Date</div>
                            <div className="col">Status</div>
                            <div className="col">Progress</div>
                            <div className="col">Actions</div>
                        </div>

                        {filteredAssignments.map((assignment) => (
                            <div key={assignment._id} className="table-row" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(6, 1fr)',
                                padding: '15px',
                                borderBottom: '1px solid #eee',
                                alignItems: 'center',
                                color: '#2c3e50'
                            }}>
                                <div className="col" style={{ fontWeight: '500' }}>{assignment.name}</div>
                                <div className="col">{assignment.course}</div>
                                <div className="col">
                                    <div className="due-date" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <span>{new Date(assignment.due_date).toLocaleDateString()}</span>
                                        {assignment.days_left && (
                                            <span className={`days-left ${assignment.days_left < 3 ? 'urgent' : ''}`} style={{
                                                color: assignment.days_left < 3 ? '#e74c3c' : '#2ecc71',
                                                fontSize: '0.9em'
                                            }}>
                                                {assignment.days_left} days left
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="col">
                                    <span className={`status ${assignment.status?.toLowerCase() || 'not-started'}`} style={{
                                        padding: '5px 10px',
                                        borderRadius: '15px',
                                        fontSize: '0.9em',
                                        backgroundColor: assignment.status === 'Submitted' ? '#2ecc71' :
                                                       assignment.status === 'In Progress' ? '#f1c40f' : '#95a5a6',
                                        color: 'white'
                                    }}>
                                        {assignment.status || 'Not Started'}
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="progress-bar" style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#ecf0f1',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="progress-fill" style={{
                                            width: `${assignment.progress || 0}%`,
                                            height: '100%',
                                            backgroundColor: '#3498db',
                                            transition: 'width 0.3s ease'
                                        }}/>
                                    </div>
                                    <span className="progress-text" style={{ fontSize: '0.9em', color: '#7f8c8d', marginTop: '5px' }}>
                                        {assignment.progress || 0}%
                                    </span>
                                </div>
                                <div className="col actions" style={{ display: 'flex', gap: '10px' }}>
                                    <button className="action-btn secondary" style={{
                                        padding: '8px 15px',
                                        borderRadius: '5px',
                                        border: '1px solid #3498db',
                                        backgroundColor: 'white',
                                        color: '#3498db',
                                        cursor: 'pointer'
                                    }} onClick={() => handleDownload(assignment)}>
                                        Download
                                    </button>
                                    <button className="action-btn primary" style={{
                                        padding: '8px 15px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }} onClick={() => handleSubmit(assignment)}
                                        disabled={assignment.status === 'Submitted' || assignment.status === 'Graded'}>
                                        {assignment.status === 'Submitted' ? 'Submitted' :
                                         assignment.status === 'Graded' ? 'Graded' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedAssignment && (
                <SubmitAssignmentModal
                    isOpen={isSubmitModalOpen}
                    onClose={() => {
                        setIsSubmitModalOpen(false);
                        setSelectedAssignment(null);
                    }}
                    assignment={selectedAssignment}
                    onSubmissionComplete={handleSubmissionComplete}
                />
            )}
        </div>
    );
};

export default StudentDashboard;