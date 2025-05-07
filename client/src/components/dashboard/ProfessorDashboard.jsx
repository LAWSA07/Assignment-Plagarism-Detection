import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAssignmentModal from './CreateAssignmentModal';
import PlagiarismReportModal from './PlagiarismReportModal';
import './Dashboard.css';
import './DashboardTheme.css';
import '../LightTheme.css';

const ProfessorDashboard = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isPlagiarismModalOpen, setIsPlagiarismModalOpen] = useState(false);
    const [setActiveTab] = useState('assignments');

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                console.log('No user found, redirecting to login');
                navigate('/login');
                return;
            }

            // Check if user is a professor
            if (user.user_type !== 'professor') {
                console.log('User is not a professor, redirecting to student dashboard');
                navigate('/student/dashboard');
                return;
            }

            verifySession();
        } catch (error) {
            console.error('Session verification error:', error);
            navigate('/login');
        }
    }, [navigate]);

    const verifySession = async () => {
        try {
            console.log('Verifying professor session...');
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

            if (!data.logged_in || data.user_type !== 'professor') {
                console.log('Not logged in as professor, redirecting to login');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            fetchAssignments(); // Fetch professor-specific data
        } catch (error) {
            console.error('Session verification error:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const fetchAssignments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/professor/assignments', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch assignments');
            }

            const data = await response.json();
            setAssignments(data);

            // Fetch submissions for each assignment
            data.forEach(assignment => {
                fetchSubmissions(assignment.id);
            });
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/assignments/${assignmentId}/submissions`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            const data = await response.json();
            setSubmissions(prev => ({
                ...prev,
                [assignmentId]: data
            }));
        } catch (error) {
            console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleAssignmentCreated = (newAssignment) => {
        setAssignments([...assignments, newAssignment]);
    };

    const handleViewPlagiarismReport = (submission) => {
        setSelectedSubmission(submission);
        setIsPlagiarismModalOpen(true);
    };

    const stats = {
        totalAssignments: assignments.length,
        activeAssignments: assignments.filter(a => a.status === 'Active').length,
        totalSubmissions: Object.values(submissions).flat().length,
        highPlagiarismCount: Object.values(submissions)
            .flat()
            .filter(s => s.plagiarism_score >= 40).length
    };

    const renderSubmissionsTable = (assignmentId) => {
        const assignmentSubmissions = submissions[assignmentId] || [];

        if (assignmentSubmissions.length === 0) {
            return <p>No submissions yet</p>;
        }

        return (
            <div className="submissions-table">
                <div className="table-header">
                    <div className="col">Student</div>
                    <div className="col">Submitted At</div>
                    <div className="col">Status</div>
                    <div className="col">Plagiarism Score</div>
                    <div className="col">Actions</div>
                </div>
                {assignmentSubmissions.map(submission => (
                    <div key={submission.id} className="table-row">
                        <div className="col">{submission.student_name}</div>
                        <div className="col">
                            {new Date(submission.submitted_at).toLocaleString()}
                        </div>
                        <div className="col">
                            <span className={`status ${submission.processing_status.toLowerCase()}`}>
                                {submission.processing_status}
                            </span>
                        </div>
                        <div className="col">
                            {submission.processing_status === 'Completed' ? (
                                <span
                                    className={`plagiarism-score ${
                                        submission.plagiarism_score >= 70 ? 'high' :
                                        submission.plagiarism_score >= 40 ? 'medium' : 'low'
                                    }`}
                                >
                                    {submission.plagiarism_score.toFixed(1)}%
                                </span>
                            ) : (
                                submission.processing_status
                            )}
                        </div>
                        <div className="col actions">
                            <button
                                className="action-btn"
                                onClick={() => handleViewPlagiarismReport(submission)}
                                disabled={submission.processing_status !== 'Completed'}
                            >
                                View Report
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="theme-center" style={{ minHeight: '100vh', background: '#FAF6F2' }}>
            <div className="theme-card" style={{ maxWidth: 1200, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#222' }}>Professor Dashboard</h1>
                    <button className="theme-btn" onClick={handleLogout}>Logout</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                    <button onClick={() => navigate('/student/dashboard')} className="theme-btn" style={{ background: '#fff', color: '#FF914D', border: '2px solid #FF914D' }}>Student Portal</button>
                    <button onClick={() => navigate('/professor/dashboard')} className="theme-btn" style={{ background: '#FF914D', color: '#fff' }}>Professor Portal</button>
                </div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Total Assignments</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: '#FF914D' }}>{stats.totalAssignments}</div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Active Assignments</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: '#FF914D' }}>{stats.activeAssignments}</div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Total Submissions</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: '#FF914D' }}>{stats.totalSubmissions}</div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>High Similarity</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: stats.highPlagiarismCount > 0 ? '#dc3545' : '#FF914D' }}>{stats.highPlagiarismCount}</div>
                    </div>
                </div>
                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#222', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Assignments & Submissions</span>
                        <button className="theme-btn" onClick={() => setIsModalOpen(true)}>Create Assignment</button>
                    </div>
                    {isLoading ? (
                        <div style={{ color: '#888', fontWeight: 700 }}>Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                        <div style={{ color: '#888', fontWeight: 700 }}>No assignments created yet. Click the "Create Assignment" button to get started.</div>
                    ) : (
                        <div style={{ width: '100%' }}>
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="card" style={{ marginBottom: 24, borderRadius: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #f0e9e0', paddingBottom: 8, marginBottom: 12 }}>
                                        <h3 style={{ color: '#222', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{assignment.name}</h3>
                                        <span style={{ background: '#FF914D', color: '#fff', fontWeight: 700, padding: '6px 18px', borderRadius: 12, fontSize: '1rem' }}>{assignment.course}</span>
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <p style={{ color: '#444', fontWeight: 700, margin: 0 }}><strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
                                        <p style={{ color: '#444', fontWeight: 700, margin: 0 }}><strong>Status:</strong> {assignment.status}</p>
                                    </div>
                                    <div style={{ marginTop: 18 }}>
                                        <h4 style={{ color: '#222', fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>Submissions</h4>
                                        {renderSubmissionsTable(assignment.id)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <CreateAssignmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAssignmentCreated={handleAssignmentCreated}
                />
                <PlagiarismReportModal
                    isOpen={isPlagiarismModalOpen}
                    onClose={() => {
                        setIsPlagiarismModalOpen(false);
                        setSelectedSubmission(null);
                    }}
                    submission={selectedSubmission}
                />
            </div>
        </div>
    );
};

export default ProfessorDashboard;