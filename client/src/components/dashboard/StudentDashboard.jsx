import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import './Dashboard.css';
import './DashboardTheme.css';
import '../LightTheme.css';
import { FaBook, FaCalendarAlt, FaChalkboardTeacher, FaBell, FaMoneyCheckAlt, FaUserCircle, FaRegLifeRing, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import LibraryPage from '../student/LibraryPage';
import TimetablePage from '../student/TimetablePage';
import NotificationsPage from '../student/NotificationsPage';
import SupportPage from '../student/SupportPage';
import ProfilePage from '../student/ProfilePage';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [user, setUser] = useState(null);

    useEffect(() => {
        verifyAndLoadData();
    }, [navigate]);

    const verifyAndLoadData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            setUser(user);
            if (!user) {
                navigate('/login');
                return;
            }
            if (user.user_type !== 'student') {
                navigate('/professor/dashboard');
                return;
            }
            await verifySession();
        } catch (error) {
            setError('Failed to verify session. Please try logging in again.');
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
        <div style={{ minHeight: '100vh' }}>
            {/* Top Bar */}
            <div className="top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {user?.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt="Profile"
                            className="profile-avatar"
                        />
                    ) : (
                        <FaUserCircle size={32} color="#1976D2" />
                    )}
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1976D2' }}>{user?.firstName || 'Student'} {user?.lastName || ''}</span>
                    <span style={{ color: '#888', fontSize: '0.95rem', marginLeft: 8 }}>Student Portal</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* Sidebar */}
                <div className="sidebar">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px 24px 24px' }}>
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                            ) : (
                                <FaUserCircle size={28} color="#1976D2" />
                            )}
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#222' }}>{user?.firstName || 'Student'}</div>
                                <div style={{ fontSize: '0.92rem', color: '#888' }}>Dashboard</div>
                            </div>
                        </div>
                        <div style={{ padding: '0 12px' }}>
                            <div style={{ color: '#888', fontWeight: 600, fontSize: 13, margin: '16px 0 4px 8px', letterSpacing: 1 }}>MAIN</div>
                            <SidebarLink icon={<FaClipboardList />} label="Assignments" onClick={() => navigate('/student/dashboard')} active={location.pathname.startsWith('/student/dashboard')} />
                            <SidebarLink icon={<FaBook />} label="Library" onClick={() => navigate('/student/library')} active={location.pathname.startsWith('/student/library')} />
                            <SidebarLink icon={<FaCalendarAlt />} label="Timetable" onClick={() => navigate('/student/timetable')} active={location.pathname.startsWith('/student/timetable')} />
                            <SidebarLink icon={<FaBell />} label="Notifications" onClick={() => navigate('/student/notifications')} active={location.pathname.startsWith('/student/notifications')} />
                            <div style={{ color: '#888', fontWeight: 600, fontSize: 13, margin: '20px 0 4px 8px', letterSpacing: 1 }}>SUPPORT</div>
                            <SidebarLink icon={<FaRegLifeRing />} label="Support" onClick={() => navigate('/student/support')} active={location.pathname.startsWith('/student/support')} />
                            <SidebarLink icon={<FaUserCircle />} label="Profile" onClick={() => navigate('/student/profile')} active={location.pathname.startsWith('/student/profile')} />
                        </div>
                    </div>
                </div>
                {/* Main Content */}
                <div className="theme-card" style={{ maxWidth: 1200, width: '100%', margin: '32px auto', minHeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#222' }}>Student Dashboard</h1>
                    <button className="theme-btn" onClick={handleLogout}>Logout</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                        <button onClick={() => navigate('/student/dashboard')} className="theme-btn" style={{ background: '#1976D2', color: '#fff' }}>Student Portal</button>
                        <button onClick={() => navigate('/professor/dashboard')} className="theme-btn" style={{ background: '#fff', color: '#1976D2', border: '2px solid #1976D2' }}>Professor Portal</button>
                </div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Pending Assignments</div>
                            <div style={{ fontWeight: 900, fontSize: '2rem', color: '#1976D2' }}>{stats.pendingAssignments}</div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Completed Assignments</div>
                            <div style={{ fontWeight: 900, fontSize: '2rem', color: '#1976D2' }}>{stats.completedAssignments}</div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ color: '#888', fontWeight: 700 }}>Average Score</div>
                            <div style={{ fontWeight: 900, fontSize: '2rem', color: '#1976D2' }}>{stats.averageScore}</div>
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
                                                <span style={{ padding: '5px 10px', borderRadius: 12, fontSize: '0.95em', background: '#1976D2', color: '#fff', fontWeight: 700 }}>{assignment.status || 'Not Started'}</span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                                <div style={{ width: '100%', height: '8px', background: '#e3eafc', borderRadius: 8, overflow: 'hidden' }}>
                                                    <div style={{ width: `${assignment.progress || 0}%`, height: '100%', background: '#1976D2', transition: 'width 0.3s' }} />
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
                    <Routes>
                        <Route path="dashboard" element={<AssignmentsDashboardContent /* pass props as needed */ />} />
                        <Route path="library" element={<LibraryPage />} />
                        <Route path="timetable" element={<TimetablePage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="support" element={<SupportPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="dashboard" />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

// Helper SidebarLink component
function SidebarLink({ icon, label, onClick, active }) {
    return (
        <div onClick={onClick} className={`sidebar-link${active ? ' active' : ''}`}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
        </div>
    );
}

// Extract assignments dashboard content to a component
function AssignmentsDashboardContent(props) {
    // ...copy the assignments dashboard JSX here (from the main content area)...
    // Use props as needed for assignments, filters, etc.
}

export default StudentDashboard;