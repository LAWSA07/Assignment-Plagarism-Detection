import React from "react";

export default function GridDotBackground() {
  return (
    <svg
      className="grid-dot-bg-svg"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
      focusable="false"
    >
      {/* Grid lines */}
      <g stroke="#e0e0e0" strokeWidth="0.5">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
        ))}
      </g>
      {/* Dots */}
      <g fill="#bdbdbd">
        {Array.from({ length: 11 }).flatMap((_, i) =>
          Array.from({ length: 11 }).map((_, j) => (
            <circle
              key={`d${i}-${j}`}
              cx={i * 10}
              cy={j * 10}
              r="0.7"
              fill="#bdbdbd"
            />
          ))
        )}
      </g>
    </svg>
  );
} 