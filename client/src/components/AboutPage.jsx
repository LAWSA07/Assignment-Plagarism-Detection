import React from 'react';
import ResizableNavbar from './ResizableNavbar';

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Cal Sans, Arial, sans-serif', minHeight: '100vh', background: '#FAF6F2' }}>
      <ResizableNavbar />
      <main style={{ maxWidth: 800, margin: '48px auto', padding: 24 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 18 }}>About</h1>
        <p style={{ fontSize: '1.2rem', color: '#444' }}>
          PlagExit is dedicated to making academic integrity effortless and accessible. Our mission is to empower educators and students with fast, fair, and transparent plagiarism detection and grading tools, all wrapped in a delightful, modern interface.
        </p>
      </main>
    </div>
  );
} 