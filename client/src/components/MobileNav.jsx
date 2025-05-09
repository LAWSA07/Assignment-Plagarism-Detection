import React from "react";

export default function MobileNav({ visible, children }) {
  return (
    <div className={`aceternity-mobilenav${visible ? " visible" : ""}`}>
      {children}
    </div>
  );
} 