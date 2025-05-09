import React from "react";

export default function NavbarButton({ href, children, variant = "primary", ...props }) {
  return (
    <a
      href={href}
      className={`aceternity-navbar-btn ${variant}`}
      {...props}
    >
      {children}
    </a>
  );
} 