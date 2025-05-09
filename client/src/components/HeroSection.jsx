import React from "react";
import "./HeroSection.css";
import GridDotBackground from "./GridDotBackground";
import BackgroundLines from "./BackgroundLines";

export default function HeroSection() {
  return (
    <section className="aceternity-hero-section">
      <GridDotBackground />
      <BackgroundLines />
      <div className="aceternity-hero-container">
        {/* Left: Text */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 className="aceternity-hero-title animate-fade-in">
            Detect Plagiarism in Minutes, Not Hours
          </h1>
          <p className="aceternity-hero-desc animate-fade-in delay-100">
            With our advanced AI-powered plagiarism detection system, you can check assignments instantly. Experience our state-of-the-art technology that identifies similarities and ensures academic integrity.
          </p>
          <div className="aceternity-hero-actions animate-fade-in delay-200">
            <a
              href="/login"
              className="aceternity-hero-btn aceternity-hero-btn-primary"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="aceternity-hero-btn aceternity-hero-btn-secondary"
            >
              Learn More
            </a>
          </div>
        </div>
        {/* Right: Image */}
        <div style={{ flex: 1, minWidth: 220, display: "flex", justifyContent: "center" }}>
          <img
            src="/architecture.png"
            alt="Plagiarism Detection Illustration"
            className="aceternity-hero-image"
          />
        </div>
      </div>
    </section>
  );
} 