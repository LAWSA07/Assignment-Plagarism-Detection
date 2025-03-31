import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateAssignmentModal from './CreateAssignmentModal';
import PlagiarismReportModal from './PlagiarismReportModal';
import './Dashboard.css';
import { checkSession, fetchProfessorAssignments, logout, api } from '../../services/auth';

const ProfessorDashboard = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isPlagiarismModalOpen, setIsPlagiarismModalOpen] = useState(false);
    const [setActiveTab] = useState('assignments');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyAndLoadData = async () => {
            try {
                console.log('Verifying professor session...');
                const sessionData = await checkSession();
                console.log('Session data:', sessionData);

                if (!sessionData.logged_in || !sessionData.user) {
                    throw new Error('Not logged in');
                }

                // Check if user is a professor
                if (sessionData.user.user_type !== 'professor') {
                    console.log('User is not a professor, redirecting to student dashboard');
                    navigate('/student-dashboard');
                    return;
                }

                // Load assignments
                await loadAssignments();
            } catch (error) {
                console.error('Session verification error:', error);
                setError('Session verification failed. Please log in again.');
                // Clear any stored user data
                localStorage.removeItem('user');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        verifyAndLoadData();
    }, [navigate]);

    const loadAssignments = async () => {
        try {
            const data = await fetchProfessorAssignments();
            setAssignments(data);

            // Fetch submissions for each assignment
            data.forEach(assignment => {
                fetchSubmissions(assignment.id);
            });
        } catch (error) {
            console.error('Error loading assignments:', error);
            setError('Failed to load assignments');
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}/submissions`);
            const data = response.data;
            setSubmissions(prev => ({
                ...prev,
                [assignmentId]: data
            }));
        } catch (error) {
            console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
            setError(`Failed to load submissions for assignment ${assignmentId}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            // Clear any stored user data
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setError('Failed to logout');
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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Professor Dashboard</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="stats-container">
                <div className="stat-card">
                    <h3>Total Assignments</h3>
                    <p className="stat-number">{stats.totalAssignments}</p>
                    <p className="stat-label">Created</p>
                </div>

                <div className="stat-card">
                    <h3>Active Assignments</h3>
                    <p className="stat-number">{stats.activeAssignments}</p>
                    <p className="stat-label">In progress</p>
                </div>

                <div className="stat-card">
                    <h3>Total Submissions</h3>
                    <p className="stat-number">{stats.totalSubmissions}</p>
                    <p className="stat-label">Received</p>
                </div>

                <div className="stat-card">
                    <h3>High Similarity</h3>
                    <p className="stat-number" style={{ color: stats.highPlagiarismCount > 0 ? '#dc3545' : '#28a745' }}>
                        {stats.highPlagiarismCount}
                    </p>
                    <p className="stat-label">Submissions needing review</p>
                </div>
            </div>

            <div className="content-section">
                <div className="section-header">
                    <h2>Assignments & Submissions</h2>
                    <button className="create-btn" onClick={() => setIsModalOpen(true)}>
                        Create Assignment
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                    <div className="no-assignments">
                        No assignments created yet. Click the "Create Assignment" button to get started.
                    </div>
                ) : (
                    <div className="assignments-list">
                        {assignments.map((assignment) => (
                            <div key={assignment.id} className="assignment-card">
                                <div className="assignment-header">
                                    <h3>{assignment.name}</h3>
                                    <span className="course-tag">{assignment.course}</span>
                                </div>
                                <div className="assignment-details">
                                    <p><strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
                                    <p><strong>Status:</strong> {assignment.status}</p>
                                </div>
                                <div className="submissions-section">
                                    <h4>Submissions</h4>
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
    );
};

export default ProfessorDashboard;