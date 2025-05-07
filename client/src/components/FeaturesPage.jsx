import React from 'react';
import ResizableNavbar from './ResizableNavbar';

export default function FeaturesPage() {
  return (
    <div style={{ fontFamily: 'Cal Sans, Arial, sans-serif', minHeight: '100vh', background: '#FAF6F2' }}>
      <ResizableNavbar />
      <main style={{ maxWidth: 800, margin: '48px auto', padding: 24 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 18 }}>Features</h1>
        <p style={{ fontSize: '1.2rem', color: '#444' }}>
          PlagExit offers instant, unbiased grading, advanced plagiarism detection (including AI-generated text), and intuitive dashboards for both students and professors. Enjoy a modern, playful UI with animated elements and seamless navigation.
        </p>
      </main>
    </div>
  );
} 