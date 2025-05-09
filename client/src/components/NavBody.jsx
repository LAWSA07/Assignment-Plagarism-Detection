import React from "react";

export default function NavBody({ visible, children }) {
  return (
    <div className={`aceternity-navbody${visible ? " visible" : ""}`}>
      {children}
    </div>
  );
} 