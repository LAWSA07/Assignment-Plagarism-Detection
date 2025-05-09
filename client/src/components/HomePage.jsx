import React from 'react';
import ResizableNavbar from './ResizableNavbar';
import HeroSection from './HeroSection';
import TrustedByMarquee from './TrustedByMarquee';
import StickyScrollRevealDemo from './sticky-scroll-reveal-demo';
// import { motion } from "framer-motion"; // No longer needed

const FEATURES = [
  { icon: '⚡', title: 'Instant Plagiarism Check', desc: 'Get results in seconds with our high-performance AI engine.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Your assignments and data are encrypted and never shared.' },
  { icon: '📊', title: 'Detailed Reports', desc: 'Easy-to-read, actionable plagiarism reports for every submission.' },
  { icon: '👩‍🏫', title: 'For Students & Professors', desc: 'Simple dashboards for both roles. No training required.' }
];

export default function HomePage() {
  return (
    <>
      <div className="framer-bg-orb-green"></div>
      {/* Green Arc SVG */}
      <svg
        className="framer-bg-arc-green"
        width="100vw"
        height="600"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 400 Q 720 200 1440 400"
          stroke="#27ae60"
          strokeWidth="8"
          fill="none"
          opacity="0.18"
          filter="url(#blur)"
        />
        <defs>
          <filter id="blur" x="-20" y="0" width="1480" height="600">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
      </svg>
      {/* Subtle Green Grid SVG */}
      <svg
        className="framer-bg-grid-green"
        width="100vw"
        height="100vh"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.08" stroke="#27ae60">
          {Array.from({ length: 15 }).map((_, i) => (
            <line key={i} x1={i * 100} y1="0" x2={i * 100} y2="900" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 100} x2="1440" y2={i * 100} />
          ))}
        </g>
      </svg>
      <div style={{ position: "relative", minHeight: '100vh', fontFamily: 'Inter, Cal Sans, Arial, sans-serif', display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        {/* <div className="fullpage-grid-bg" /> */}
        <ResizableNavbar />
        {/* News Banner */}
        <div style={{ width: '100%', background: '#F6F6F6', color: '#222', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          🚀 New: AI-powered plagiarism detection now faster than ever!
        </div>
        <HeroSection />
        <TrustedByMarquee />
        {/* Features Section - replaced with StickyScrollRevealDemo */}
        <div style={{ margin: '48px 0' }}>
          <StickyScrollRevealDemo />
        </div>
        {/* Minimal Footer */}
        <footer style={{ marginTop: 'auto', background: '#fff', borderTop: '1.5px solid #eee', padding: '24px 0 12px 0', textAlign: 'center', fontSize: '1rem', color: '#888', fontFamily: 'Inter, Cal Sans, Arial, sans-serif' }}>
          <div style={{ marginBottom: 6 }}>
            &copy; {new Date().getFullYear()} PlagExit Edu
          </div>
          <div>
            <a href="/contact" style={{ color: '#1976D2', textDecoration: 'underline', margin: '0 12px' }}>Contact</a>
            <a href="/how-it-works" style={{ color: '#1976D2', textDecoration: 'underline', margin: '0 12px' }}>How It Works</a>
          </div>
        </footer>
      </div>
    </>
  );
} 