import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import CreateAssignmentModal from './CreateAssignmentModal';
import PlagiarismReportModal from './PlagiarismReportModal';
import './Dashboard.css';
import './DashboardTheme.css';
import '../LightTheme.css';
import { FaBook, FaCalendarAlt, FaChalkboardTeacher, FaBell, FaUserCircle, FaRegLifeRing, FaClipboardList, FaUsers, FaChartBar } from 'react-icons/fa';
import ProfessorProfile from './ProfessorProfile';
import ModernNavbar from '../ModernNavbar';

// Placeholder components for new pages
function StudentDirectoryPage() {
    return <div style={{ padding: 32 }}><h2 style={{ color: '#1976D2' }}>Student Directory</h2><p>Feature coming soon.</p></div>;
}
function TimetablePage() {
    const [section, setSection] = React.useState('');
    const [file, setFile] = React.useState(null);
    const [timetables, setTimetables] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    React.useEffect(() => {
        fetchTimetables();
    }, []);

    const fetchTimetables = () => {
        setLoading(true);
        fetch('/api/timetable/list', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setTimetables(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load timetables');
                setLoading(false);
            });
    };

    const handleUpload = e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!section || !file) {
            setError('Section and PDF file are required');
            return;
        }
        const formData = new FormData();
        formData.append('section', section);
        formData.append('pdf', file);
        fetch('/api/timetable/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSuccess('Timetable uploaded successfully!');
                    setSection('');
                    setFile(null);
                    fetchTimetables();
                } else {
                    setError(data.error || 'Upload failed');
                }
            })
            .catch(() => setError('Upload failed'));
    };

    const handleDelete = section => {
        setError('');
        setSuccess('');
        fetch(`/api/timetable/${section}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSuccess('Timetable deleted');
                    fetchTimetables();
                } else {
                    setError(data.error || 'Delete failed');
                }
            })
            .catch(() => setError('Delete failed'));
    };

    return (
        <div style={{ padding: 32 }}>
            <h2 style={{ color: '#1976D2' }}>Timetable Management</h2>
            <form onSubmit={handleUpload} style={{ marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Section (e.g., A, B, C)"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', minWidth: 120 }}
                />
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setFile(e.target.files[0])}
                    style={{ padding: 8 }}
                />
                <button type="submit" className="theme-btn" style={{ background: '#1976D2', color: '#fff' }}>Upload</button>
            </form>
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ color: '#1976D2', marginBottom: 16 }}>{success}</div>}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
                    <thead>
                        <tr style={{ background: '#F4F6FA' }}>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Section</th>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Upload Date</th>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timetables.map(t => (
                            <tr key={t.section}>
                                <td style={{ padding: 12 }}>{t.section}</td>
                                <td style={{ padding: 12 }}>{new Date(t.upload_date).toLocaleString()}</td>
                                <td style={{ padding: 12 }}>
                                    <a href={`/api/timetable/${t.section}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', marginRight: 16 }}>Download</a>
                                    <button onClick={() => handleDelete(t.section)} style={{ color: '#fff', background: '#dc3545', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
function ReportsPage() {
    return <div style={{ padding: 32 }}><h2 style={{ color: '#1976D2' }}>Reports</h2><p>Feature coming soon.</p></div>;
}
function NotificationsPage() {
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [form, setForm] = React.useState({ section: '', title: '', message: '' });

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = () => {
        setLoading(true);
        fetch('/api/notifications/professor', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setNotifications(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load notifications');
                setLoading(false);
            });
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.section || !form.title || !form.message) {
            setError('All fields are required');
            return;
        }
        fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSuccess('Notification created!');
                    setForm({ section: '', title: '', message: '' });
                    fetchNotifications();
                } else {
                    setError(data.error || 'Failed to create notification');
                }
            })
            .catch(() => setError('Failed to create notification'));
    };

    const handleDelete = id => {
        setError('');
        setSuccess('');
        fetch(`/api/notifications/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSuccess('Notification deleted');
                    fetchNotifications();
                } else {
                    setError(data.error || 'Delete failed');
                }
            })
            .catch(() => setError('Delete failed'));
    };

    return (
        <div style={{ padding: 32 }}>
            <h2 style={{ color: '#1976D2' }}>Notifications Management</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center' }}>
                <input
                    type="text"
                    name="section"
                    placeholder="Section (e.g., A, B, C)"
                    value={form.section}
                    onChange={handleChange}
                    style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', minWidth: 120 }}
                />
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                    style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', minWidth: 180 }}
                />
                <input
                    type="text"
                    name="message"
                    placeholder="Message"
                    value={form.message}
                    onChange={handleChange}
                    style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', minWidth: 240 }}
                />
                <button type="submit" className="theme-btn" style={{ background: '#1976D2', color: '#fff' }}>Create</button>
            </form>
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ color: '#1976D2', marginBottom: 16 }}>{success}</div>}
            {loading ? (
                <div>Loading...</div>
            ) : notifications.length === 0 ? (
                <div style={{ color: '#888' }}>No notifications created yet.</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
                    <thead>
                        <tr style={{ background: '#F4F6FA' }}>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Section</th>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Title</th>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Message</th>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Date</th>
                            <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map(n => (
                            <tr key={n.id}>
                                <td style={{ padding: 12 }}>{n.section}</td>
                                <td style={{ padding: 12 }}>{n.title}</td>
                                <td style={{ padding: 12 }}>{n.message}</td>
                                <td style={{ padding: 12 }}>{n.date}</td>
                                <td style={{ padding: 12 }}>
                                    <button onClick={() => handleDelete(n.id)} style={{ color: '#fff', background: '#dc3545', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
function SupportPage() {
    return <div style={{ padding: 32 }}><h2 style={{ color: '#1976D2' }}>Support</h2><p>Feature coming soon.</p></div>;
}

const sidebarLinks = [
    { key: 'dashboard', icon: <FaClipboardList />, label: 'Assignments', path: 'dashboard' },
    { key: 'student-directory', icon: <FaUsers />, label: 'Student Directory', path: 'student-directory' },
    { key: 'timetable', icon: <FaCalendarAlt />, label: 'Timetable', path: 'timetable' },
    { key: 'reports', icon: <FaChartBar />, label: 'Reports', path: 'reports' },
    { key: 'notifications', icon: <FaBell />, label: 'Notifications', path: 'notifications' },
    { key: 'support', icon: <FaRegLifeRing />, label: 'Support', path: 'support' },
    { key: 'profile', icon: <FaUserCircle />, label: 'Profile', path: 'profile' },
];

function SidebarLink({ icon, label, onClick, active }) {
    return (
        <div onClick={onClick} className={`sidebar-link${active ? ' active' : ''}`}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
        </div>
    );
}

// Replace the placeholder AssignmentsDashboardContent with the real dashboard UI
function AssignmentsDashboardContent({
    assignments,
    isLoading,
    onCreateAssignment,
    renderSubmissionsTable,
    stats
}) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#222' }}>Professor Dashboard</h1>
                <button className="theme-btn" style={{ background: '#1976D2', color: '#fff', fontWeight: 700 }} onClick={onCreateAssignment}>
                    + Create Assignment
                </button>
            </div>
            <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                <div className="card" style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontWeight: 700 }}>Total Assignments</div>
                    <div style={{ fontWeight: 900, fontSize: '2rem', color: '#1976D2' }}>{stats.totalAssignments}</div>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontWeight: 700 }}>Active Assignments</div>
                    <div style={{ fontWeight: 900, fontSize: '2rem', color: '#1976D2' }}>{stats.activeAssignments}</div>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontWeight: 700 }}>Total Submissions</div>
                    <div style={{ fontWeight: 900, fontSize: '2rem', color: '#1976D2' }}>{stats.totalSubmissions}</div>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontWeight: 700 }}>High Plagiarism (&ge;40%)</div>
                    <div style={{ fontWeight: 900, fontSize: '2rem', color: '#c62828' }}>{stats.highPlagiarismCount}</div>
                </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#222', marginBottom: 16 }}>My Assignments</div>
            {isLoading ? (
                <div style={{ color: '#888', fontWeight: 700 }}>Loading assignments...</div>
            ) : assignments.length === 0 ? (
                <div style={{ color: '#888', fontWeight: 700 }}>No assignments created yet.</div>
            ) : (
                <div>
                    {assignments.map(assignment => (
                        <div key={assignment.id} className="assignment-card" style={{ marginBottom: 32 }}>
                            <div className="assignment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#1976D2' }}>{assignment.name}</h3>
                                    <span className="course-tag" style={{ marginLeft: 8 }}>{assignment.course}</span>
                                </div>
                                <div style={{ color: '#888', fontWeight: 600 }}>
                                    Due: {new Date(assignment.due_date).toLocaleString()}
                                </div>
                            </div>
                            <div className="assignment-details" style={{ marginBottom: 16 }}>
                                <p style={{ margin: 0 }}>{assignment.description}</p>
                                <div style={{ marginTop: 8 }}>
                                    <a href={`/api/assignments/${assignment.id}/download`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976D2', fontWeight: 600 }}>
                                        Download Question File
                                    </a>
                                </div>
                            </div>
                            <div className="submissions-section">
                                <h4 style={{ color: '#1976D2', marginBottom: 8 }}>Submissions</h4>
                                {renderSubmissionsTable(assignment.id)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const ProfessorDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isPlagiarismModalOpen, setIsPlagiarismModalOpen] = useState(false);
    const [setActiveTab] = useState('assignments');
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                console.log('No user found, redirecting to login');
                navigate('/login');
                return;
            }
            if (user.user_type !== 'professor') {
                console.log('User is not a professor, redirecting to student dashboard');
                navigate('/student/dashboard');
                return;
            }
            verifySession();
            fetchProfile();
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

    const fetchProfile = async () => {
        setProfileLoading(true);
        setProfileError('');
        try {
            const response = await fetch('http://localhost:5000/api/professor/profile', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            if (!data.success || !data.profile) throw new Error('Failed to load profile');
            setProfile(data.profile);
        } catch (error) {
            setProfileError('Failed to load profile');
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Top Bar */}
            <ModernNavbar
                user={profile}
                portalLabel="Professor Portal"
                onHome={() => navigate('/')}
                onLogout={handleLogout}
            />
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* Sidebar */}
                <div className="sidebar">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px 24px 24px' }}>
                            <FaUserCircle size={28} color="#1976D2" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#222' }}>{profile ? `${profile.firstName} ${profile.lastName}` : 'Professor'}</div>
                                <div style={{ fontSize: '0.92rem', color: '#888' }}>Dashboard</div>
                    </div>
                </div>
                        <div style={{ padding: '0 12px' }}>
                            <div style={{ color: '#888', fontWeight: 600, fontSize: 13, margin: '16px 0 4px 8px', letterSpacing: 1 }}>MAIN</div>
                            {sidebarLinks.map(link => (
                                <SidebarLink
                                    key={link.key}
                                    icon={link.icon}
                                    label={link.label}
                                    onClick={() => navigate(link.path)}
                                    active={location.pathname === `/professor/${link.path}` || (link.key === 'dashboard' && (location.pathname === '/professor' || location.pathname === '/professor/dashboard'))}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                {/* Main Content */}
                <div className="theme-card" style={{ maxWidth: 1200, width: '100%', margin: '32px auto', minHeight: 600 }}>
                    <Routes>
                        <Route path="dashboard" element={
                            <AssignmentsDashboardContent
                                assignments={assignments}
                                isLoading={isLoading}
                                onCreateAssignment={() => setIsModalOpen(true)}
                                renderSubmissionsTable={renderSubmissionsTable}
                                stats={stats}
                            />
                        } />
                        <Route path="student-directory" element={<StudentDirectoryPage />} />
                        <Route path="timetable" element={<TimetablePage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="support" element={<SupportPage />} />
                        <Route path="profile" element={<ProfessorProfile profile={profile} setProfile={setProfile} loading={profileLoading} error={profileError} fetchProfile={fetchProfile} />} />
                        <Route path="*" element={<Navigate to="dashboard" />} />
                    </Routes>
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
        </div>
    );
};

export default ProfessorDashboard;