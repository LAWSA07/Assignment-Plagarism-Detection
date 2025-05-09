import React, { useState } from 'react';

export default function SupportPage() {
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([
    { id: 1, subject: 'Unable to download assignment', status: 'Resolved', date: '2025-04-25' },
    { id: 2, subject: 'Profile update issue', status: 'Open', date: '2025-04-20' },
  ]);

  const handleSubmit = e => {
    e.preventDefault();
    if (message.trim()) {
      setTickets([
        { id: tickets.length + 1, subject: message, status: 'Open', date: new Date().toISOString().slice(0, 10) },
        ...tickets,
      ]);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#1976D2', fontWeight: 700 }}>Support</h2>
      <p style={{ color: '#555' }}>Submit your queries or issues. Our team will respond as soon as possible.</p>
      <form onSubmit={handleSubmit} style={{ margin: '24px 0', display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Describe your issue..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem' }}
          required
        />
        <button type="submit" style={{ background: '#1976D2', color: '#fff', fontWeight: 700, fontSize: '1.1rem', borderRadius: 8, padding: '12px 24px', border: 'none', cursor: 'pointer' }}>
          Submit
        </button>
      </form>
      <div style={{ marginTop: 24 }}>
        <h3 style={{ color: '#1976D2', fontWeight: 600 }}>My Tickets</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ background: '#E3F2FD', color: '#1976D2' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Subject</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td style={{ padding: 10 }}>{ticket.subject}</td>
                <td style={{ padding: 10, color: ticket.status === 'Resolved' ? '#1976D2' : '#888', fontWeight: 600 }}>{ticket.status}</td>
                <td style={{ padding: 10 }}>{ticket.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 