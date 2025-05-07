import React from 'react';
import ResizableNavbar from './ResizableNavbar';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Cal Sans, Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Clean Navbar */}
      <ResizableNavbar fintech clean />
      {/* Main Section */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: 1200, margin: '64px auto 0 auto', padding: '0 48px', gap: 64, flexWrap: 'wrap' }}>
        {/* Left: Headline and CTA */}
        <div style={{ flex: 1, minWidth: 340, maxWidth: 500, textAlign: 'left' }}>
          <h1 style={{ fontWeight: 700, fontSize: '2.8rem', color: '#111', marginBottom: 32, lineHeight: 1.1, textAlign: 'center' }}>
            Check Assignments for Plagiarism Instantly
          </h1>
          <p style={{ fontWeight: 400, fontSize: '1.15rem', color: '#222', marginBottom: 40, maxWidth: 420 }}>
            PlagExit Edu helps colleges and institutions ensure academic integrity by detecting plagiarism in student assignments—whether copied from classmates or the web. Fast, accurate, and easy for both students and professors.
          </p>
          <div style={{ display: 'flex', gap: 18, marginBottom: 32 }}>
            <a href="/login?portal=student" style={{ background: '#19C37D', color: '#fff', fontWeight: 600, fontSize: '1.08rem', borderRadius: 4, padding: '14px 36px', textDecoration: 'none', border: 'none', boxShadow: 'none', transition: 'background 0.18s' }}>Student Login</a>
            <a href="/login?portal=professor" style={{ background: '#fff', color: '#19C37D', fontWeight: 600, fontSize: '1.08rem', borderRadius: 4, padding: '14px 36px', textDecoration: 'none', border: '2px solid #19C37D', boxShadow: 'none', transition: 'background 0.18s' }}>Professor Login</a>
          </div>
        </div>
        {/* Right: Glassmorphic Card with Larger Architecture Diagram */}
        <div style={{ flex: 1, minWidth: 340, maxWidth: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'relative', background: 'rgba(255,255,255,0.92)', borderRadius: 12, border: '1.5px solid #eee', padding: '40px 36px 32px 36px', minWidth: 320, maxWidth: 560, textAlign: 'left', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            {/* Larger architecture diagram image */}
            <img src="/architecture.png" alt="Architecture Diagram" style={{ width: '100%', maxHeight: 990, objectFit: 'contain', borderRadius: 8, marginBottom: 18, border: '1px solid #eee', background: '#fafafa' }} />
          </div>
        </div>
      </div>
      {/* Minimal Footer */}
      <footer style={{ marginTop: 'auto', background: '#fff', borderTop: '1.5px solid #eee', padding: '24px 0 12px 0', textAlign: 'center', fontSize: '1rem', color: '#888', fontFamily: 'Cal Sans, Arial, sans-serif' }}>
        <div style={{ marginBottom: 6 }}>
          &copy; {new Date().getFullYear()} PlagExit Edu
        </div>
        <div>
          <a href="/contact" style={{ color: '#19C37D', textDecoration: 'underline', margin: '0 12px' }}>Contact</a>
          <a href="/how-it-works" style={{ color: '#19C37D', textDecoration: 'underline', margin: '0 12px' }}>How It Works</a>
        </div>
      </footer>
    </div>
  );
} 