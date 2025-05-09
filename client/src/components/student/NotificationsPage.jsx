import React, { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/notifications', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#1976D2', fontWeight: 700 }}>Notifications</h2>
      <p style={{ color: '#555' }}>Important updates and alerts. (View only)</p>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {notifications.length === 0 ? (
          <div>No notifications found.</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{ background: '#F4F6FA', borderRadius: 8, padding: 18, boxShadow: '0 1px 4px rgba(34,34,34,0.04)' }}>
              <div style={{ color: '#1976D2', fontWeight: 700, fontSize: 18 }}>{n.title}</div>
              <div style={{ color: '#555', margin: '8px 0' }}>{n.message}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{n.date}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 