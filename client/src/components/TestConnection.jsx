import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing API URL:', process.env.REACT_APP_API_URL);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/health`);
        setStatus(response.data.message);
        setError(null);
      } catch (err) {
        console.error('Connection error:', err);
        setError(err.message);
        setStatus('Failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Backend Connection Test</h2>
      <p>API URL: {process.env.REACT_APP_API_URL}</p>
      <p>Status: {status}</p>
      {error && (
        <p style={{ color: 'red' }}>
          Error: {error}
        </p>
      )}
    </div>
  );
};

export default TestConnection;