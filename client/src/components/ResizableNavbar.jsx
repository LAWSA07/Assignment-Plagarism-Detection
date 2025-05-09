import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import NavBody from "./NavBody";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import MobileNavToggle from "./MobileNavToggle";
import NavbarLogo from "./NavbarLogo";
import NavbarButton from "./NavbarButton";
import "./ResizableNavbar.css";

const NAV_LINKS = [
  { name: "Features", link: "/features" },
  { name: "Pricing", link: "/pricing" },
  { name: "About", link: "/about" },
  { name: "Contact", link: "/contact" },
];

export default function ResizableNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`aceternity-navbar${scrolled ? " scrolled" : ""}`}
    >
      <NavbarLogo />
      <NavBody visible={scrolled}>
        <NavItems items={NAV_LINKS} />
        <div className="aceternity-navbar-actions">
          <NavbarButton href="/login" variant="secondary">Login</NavbarButton>
          <NavbarButton href="/signup" variant="primary">Sign Up</NavbarButton>
      </div>
      </NavBody>
      <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
      <AnimatePresence>
        {mobileOpen && (
          <MobileNav visible={mobileOpen}>
            <NavItems items={NAV_LINKS} onItemClick={() => setMobileOpen(false)} />
            <div className="aceternity-navbar-actions">
              <NavbarButton href="/login" variant="secondary">Login</NavbarButton>
              <NavbarButton href="/signup" variant="primary">Sign Up</NavbarButton>
      </div>
          </MobileNav>
        )}
      </AnimatePresence>
    </nav>
  );
} 