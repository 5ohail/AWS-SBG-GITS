import React, { useState, useEffect } from 'react';
import { eventData } from '../data/event';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function Navigation({ activeSection = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Speakers', href: '#speakers', id: 'speakers' },
    { name: 'Team', href: '#team', id: 'team' },
    { name: 'Schedule', href: '#schedule', id: 'schedule' },
    { name: 'Venue', href: '#venue', id: 'venue' },
    { name: 'Sponsors', href: '#sponsors', id: 'sponsors' },
    { name: 'FAQ', href: '#faq', id: 'faq' }
  ];

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          
          {/* Top-Left: AWS Community Day Udaipur Brand Logo */}
          <a
            href="#home"
            className="nav-brand"
            aria-label="AWS Community Day Udaipur 2026"
          >
            <div className="nav-logo-group">
              <div className="nav-logo-top">
                <span className="nav-logo-aws">aws</span>
                <span className="nav-logo-sub">community day</span>
              </div>
              <div className="nav-logo-bottom">
                <svg className="nav-logo-smile" viewBox="0 0 36 9" fill="none">
                  <path
                    d="M2 3.5C11 8.5 25 8.5 34 3.5"
                    stroke="#FF9900"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 7L34 3.5L32 0.8"
                    stroke="#FF9900"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="nav-logo-city">UDAIPUR</span>
              </div>
            </div>
          </a>

          {/* Top-Center: Clean Editorial Nav Links with active dot indicator */}
          <nav className="nav-links-desktop">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Top-Right: Minimalist Registration Pill Button */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={eventData.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta-btn"
            >
              <span>Register on KonfHub</span>
              <ArrowRight className="nav-cta-arrow" />
            </a>
          </div>

          {/* Mobile Right Controls: Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="flex items-center justify-between pb-6 border-b border-subtle">
            <div className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
              NAVIGATION
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 p-2 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="mobile-nav-links">
            {navLinks.map((link, idx) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{link.name}</span>
                  <span className="mobile-nav-num">0{idx + 1}</span>
                </a>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 mt-6">
            <a
              href={eventData.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-mobile-primary-btn w-full justify-center text-sm"
              aria-label="Register on KonfHub"
            >
              <span>REGISTER ON KONFHUB</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>

            <div className="text-[11px] font-mono text-center tracking-wider" style={{ color: 'var(--text-muted)' }}>
              AWS COMMUNITY DAY · UDAIPUR 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
}
