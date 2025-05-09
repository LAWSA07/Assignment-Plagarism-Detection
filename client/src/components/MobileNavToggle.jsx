import React from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function MobileNavToggle({ isOpen, onClick }) {
  return (
    <button className="aceternity-mobilenav-toggle" onClick={onClick} aria-label="Toggle menu">
      {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
    </button>
  );
} 