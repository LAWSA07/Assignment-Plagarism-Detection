import React, { useEffect, useState } from 'react';

export default function TimetablePage() {
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfAvailable, setPdfAvailable] = useState(false);

  useEffect(() => {
    // Fetch student profile to get section
    fetch('/api/student/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile.section) {
          setSection(data.profile.section);
          checkTimetablePDF(data.profile.section);
        } else {
          setError('Could not determine your section.');
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  const checkTimetablePDF = (section) => {
    fetch(`/api/timetable/${section}`, { credentials: 'include', method: 'HEAD' })
      .then(res => {
        setPdfAvailable(res.ok);
        setLoading(false);
      })
      .catch(() => {
        setPdfAvailable(false);
        setLoading(false);
      });
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#1976D2', fontWeight: 700 }}>Timetable</h2>
      <p style={{ color: '#555' }}>Download or view your section's timetable as a PDF.</p>
      {pdfAvailable ? (
        <a
          href={`/api/timetable/${section}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fff', background: '#1976D2', padding: '12px 32px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: 24 }}
        >
          View/Download Timetable PDF
        </a>
      ) : (
        <div style={{ color: '#888', marginTop: 24 }}>No timetable PDF available for your section yet.</div>
      )}
    </div>
  );
} 