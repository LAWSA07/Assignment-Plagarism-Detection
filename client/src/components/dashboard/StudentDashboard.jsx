import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import './Dashboard.css';
import './DashboardTheme.css';
import '../LightTheme.css';

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

            await verifySession();
        } catch (error) {
            setError('Failed to verify session. Please try logging in again.');
            console.error('Session verification error:', error);
            navigate('/login');
        }
    };

    const verifySession = async () => {
        try {
            console.log('Verifying student session...');
            const response = await fetch('http://localhost:5000/api/auth/check-session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Session verification failed');
            }

            const data = await response.json();
            console.log('Session check response:', data);

            if (!data.logged_in) {
                console.log('Not logged in, redirecting to login');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            if (data.user_type !== 'student') {
                console.log('User is not a student, redirecting to professor dashboard');
                navigate('/professor/dashboard');
                return;
            }

            // Update local storage with latest user data
            localStorage.setItem('user', JSON.stringify(data.user));
            await fetchAssignments();
        } catch (error) {
            console.error('Session verification error:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const fetchAssignments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/student/assignments', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Assignments fetched:', data);
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to fetch assignments');
        } finally {
            setIsLoading(false);
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

            const response = await fetch(`http://localhost:5000/api/assignments/${assignment.id}/download`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to download assignment');
            }

            // Check content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                console.warn('Unexpected content type:', contentType);
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            console.log('File downloaded successfully. Size:', blob.size, 'Type:', blob.type);

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
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                throw new Error('Logout failed');
            }
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
        <div className="theme-center" style={{ minHeight: '100vh', background: '#FAF6F2' }}>
            <div className="theme-card" style={{ maxWidth: 1200, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#222' }}>Student Dashboard</h1>
                    <button className="theme-btn" onClick={handleLogout}>Logout</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                    <button onClick={() => navigate('/student/dashboard')} className="theme-btn" style={{ background: '#FF914D', color: '#fff' }}>Student Portal</button>
                    <button onClick={() => navigate('/professor/dashboard')} className="theme-btn" style={{ background: '#fff', color: '#FF914D', border: '2px solid #FF914D' }}>Professor Portal</button>
                </div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Pending Assignments</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: '#FF914D' }}>{stats.pendingAssignments}</div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Completed Assignments</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: '#FF914D' }}>{stats.completedAssignments}</div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Average Score</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: '#FF914D' }}>{stats.averageScore}</div>
                    </div>
                </div>
                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#222', marginBottom: 16 }}>My Assignments</div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <select className="theme-input" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                            <option>All Statuses</option>
                            <option>Not Started</option>
                            <option>In Progress</option>
                            <option>Submitted</option>
                            <option>Graded</option>
                        </select>
                        <select className="theme-input" value={filters.course} onChange={e => handleFilterChange('course', e.target.value)}>
                            <option>All Courses</option>
                            <option>CS101</option>
                            <option>CS201</option>
                            <option>CS301</option>
                            <option>CS401</option>
                        </select>
                    </div>
                    {isLoading ? (
                        <div style={{ color: '#888', fontWeight: 700 }}>Loading assignments...</div>
                    ) : filteredAssignments.length === 0 ? (
                        <div style={{ color: '#888', fontWeight: 700 }}>
                            {assignments.length === 0 ? 'No assignments available at the moment.' : 'No assignments match the selected filters.'}
                        </div>
                    ) : (
                        <table style={{ width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderCollapse: 'collapse', marginTop: 12 }}>
                            <thead>
                                <tr style={{ background: '#FAF6F2', color: '#888', fontWeight: 700 }}>
                                    <th style={{ padding: 12, borderBottom: '1.5px solid #f0e9e0' }}>Assignment</th>
                                    <th style={{ padding: 12, borderBottom: '1.5px solid #f0e9e0' }}>Course</th>
                                    <th style={{ padding: 12, borderBottom: '1.5px solid #f0e9e0' }}>Due Date</th>
                                    <th style={{ padding: 12, borderBottom: '1.5px solid #f0e9e0' }}>Status</th>
                                    <th style={{ padding: 12, borderBottom: '1.5px solid #f0e9e0' }}>Progress</th>
                                    <th style={{ padding: 12, borderBottom: '1.5px solid #f0e9e0' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssignments.map((assignment) => (
                                    <tr key={assignment._id} style={{ borderBottom: '1px solid #f0e9e0' }}>
                                        <td style={{ padding: 12 }}>{assignment.name}</td>
                                        <td style={{ padding: 12 }}>{assignment.course}</td>
                                        <td style={{ padding: 12 }}>{new Date(assignment.due_date).toLocaleDateString()}</td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ padding: '5px 10px', borderRadius: 12, fontSize: '0.95em', background: '#FF914D', color: '#fff', fontWeight: 700 }}>{assignment.status || 'Not Started'}</span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <div style={{ width: '100%', height: '8px', background: '#f0e9e0', borderRadius: 8, overflow: 'hidden' }}>
                                                <div style={{ width: `${assignment.progress || 0}%`, height: '100%', background: '#FF914D', transition: 'width 0.3s' }} />
                                            </div>
                                            <span style={{ fontSize: '0.95em', color: '#888', marginTop: '5px', fontWeight: 700 }}>{assignment.progress || 0}%</span>
                                        </td>
                                        <td style={{ padding: 12, display: 'flex', gap: '10px' }}>
                                            <button className="theme-btn" onClick={() => handleDownload(assignment)} style={{ padding: '8px 18px', fontSize: '1rem' }}>Download</button>
                                            <button className="theme-btn" onClick={() => handleSubmit(assignment)} style={{ padding: '8px 18px', fontSize: '1rem' }} disabled={assignment.status === 'Submitted' || assignment.status === 'Graded'}>
                                                {assignment.status === 'Submitted' ? 'Submitted' : assignment.status === 'Graded' ? 'Graded' : 'Submit'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
        </div>
    );
};

export default StudentDashboard;