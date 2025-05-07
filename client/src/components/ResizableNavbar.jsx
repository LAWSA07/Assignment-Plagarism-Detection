import React, { useEffect, useRef, useState } from 'react';
import styles from './ResizableNavbar.module.css';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'For Colleges', to: '/for-colleges' },
  { label: 'For Students', to: '/for-students' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Contact', to: '/contact' },
];

export default function ResizableNavbar({ fintech, transparent }) {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={styles.navbar + (scrolled ? ' ' + styles.shrunk : '')}
      style={{
        background: fintech || transparent ? 'rgba(255,255,255,0.96)' : '#fff',
        backdropFilter: fintech || transparent ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: fintech || transparent ? 'blur(12px)' : 'none',
        color: fintech || transparent ? '#111' : '#222',
        border: fintech || transparent ? '1.5px solid #eee' : '1.5px solid #eee',
        boxShadow: fintech || transparent ? '0 4px 32px rgba(34,34,34,0.10)' : '0 2px 8px rgba(34,34,34,0.06)',
        transition: 'all 0.32s cubic-bezier(.4,1,.4,1)',
        fontFamily: 'Cal Sans, Arial, sans-serif',
      }}
    >
      {/* Logo */}
      <div className={styles.logo} style={{ color: fintech || transparent ? '#111' : '#6B3F1D', fontFamily: 'Cal Sans, Arial, sans-serif', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
        {/* Graduation cap icon */}
        <svg width="32" height="32" style={{ marginRight: 10, verticalAlign: 'middle' }} viewBox="0 0 32 32" fill="none">
          <polygon points="16,6 30,14 16,22 2,14" fill={fintech || transparent ? '#19C37D' : '#FF914D'} />
          <rect x="12" y="22" width="8" height="6" rx="2" fill={fintech || transparent ? '#FFD580' : '#fff'} />
          <circle cx="26" cy="14" r="2" fill={fintech || transparent ? '#FF914D' : '#19C37D'} />
        </svg>
        PlagExit Edu
      </div>
      {/* Nav links */}
      <div className={styles.links}>
        {NAV_LINKS.map(link => (
          <Link key={link.label} to={link.to} className={styles.link} style={{ color: fintech || transparent ? '#111' : '#222', fontFamily: 'Cal Sans, Arial, sans-serif', fontWeight: 500, fontSize: '1.08rem', margin: '0 12px', textDecoration: 'none' }}>{link.label}</Link>
        ))}
      </div>
      {/* Right: Get Started button */}
      <div className={styles.actions}>
        <a href="/register" style={{ background: '#19C37D', color: '#fff', fontWeight: 700, fontSize: '1.08rem', borderRadius: 8, padding: '10px 28px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,34,34,0.10)', border: 'none', marginLeft: 18, fontFamily: 'Cal Sans, Arial, sans-serif', transition: 'background 0.18s' }}>Get Started</a>
      </div>
    </nav>
  );
} 