import React from 'react';
import ResizableNavbar from './ResizableNavbar';

export default function ContactPage() {
  return (
    <div style={{ fontFamily: 'Cal Sans, Arial, sans-serif', minHeight: '100vh', background: '#FAF6F2' }}>
      <ResizableNavbar />
      <main style={{ maxWidth: 800, margin: '48px auto', padding: 24 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 18 }}>Contact</h1>
        <p style={{ fontSize: '1.2rem', color: '#444' }}>
          Have questions, feedback, or need support? Reach out to the PlagExit team and we'll be happy to help you on your journey to academic integrity.
        </p>
      </main>
    </div>
  );
} 