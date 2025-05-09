import React from "react";

export default function BackgroundLines() {
  return (
    <svg
      className="background-lines-svg"
      viewBox="0 0 900 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 160 Q 225 80 450 160 T 900 160"
        stroke="#1db954"
        strokeWidth="2.5"
        fill="none"
        style={{
          strokeDasharray: 12,
          strokeDashoffset: 0,
          animation: 'dashmove 6s linear infinite',
          opacity: 0.18
        }}
      />
      <path
        d="M0 200 Q 225 120 450 200 T 900 200"
        stroke="#111"
        strokeWidth="2"
        fill="none"
        style={{
          strokeDasharray: 18,
          strokeDashoffset: 0,
          animation: 'dashmove 8s linear infinite',
          opacity: 0.10
        }}
      />
      <path
        d="M0 240 Q 225 160 450 240 T 900 240"
        stroke="#888"
        strokeWidth="1.5"
        fill="none"
        style={{
          strokeDasharray: 24,
          strokeDashoffset: 0,
          animation: 'dashmove 10s linear infinite',
          opacity: 0.10
        }}
      />
    </svg>
  );
} 