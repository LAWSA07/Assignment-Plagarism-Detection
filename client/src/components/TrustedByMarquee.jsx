import React from "react";
import "./TrustedByMarquee.css";

const LOGOS = [
  "/logo1.jpg",
  "/logo2.png",
  "/logo3.jpeg",
  "/logo4.jpeg"
];

export default function TrustedByMarquee() {
  // Duplicate the logos for seamless looping
  const logos = [...LOGOS, ...LOGOS];
  return (
    <div className="trustedby-marquee-bg">
      <div className="trustedby-marquee-label">
        Trusted by leading universities
      </div>
      <div className="trustedby-marquee-track">
        {logos.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="University Logo"
            className="trustedby-marquee-logo"
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
} 