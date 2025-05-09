import React, { useEffect, useState } from 'react';

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/library/books', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load books');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#1976D2', fontWeight: 700 }}>Library</h2>
      <p style={{ color: '#555' }}>Browse available books and resources. (View only)</p>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(34,34,34,0.04)', padding: 24, marginTop: 24 }}>
        {books.length === 0 ? (
          <div>No books found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F4F6FA' }}>
                <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Title</th>
                <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Author</th>
                <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>Status</th>
                <th style={{ color: '#1976D2', fontWeight: 700, padding: 12, textAlign: 'left' }}>ISBN</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td style={{ padding: 12 }}>{book.title}</td>
                  <td style={{ padding: 12 }}>{book.author}</td>
                  <td style={{ padding: 12 }}>{book.status}</td>
                  <td style={{ padding: 12 }}>{book.isbn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 