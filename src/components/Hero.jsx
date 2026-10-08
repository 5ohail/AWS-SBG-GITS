import React from 'react';
import { eventData } from '../data/event';
import GlassScene from './GlassScene';
import { Calendar, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Hero({ mouse, scrollProgress }) {
  const scrollToAbout = (e) => {
    e.preventDefault();
    const target = document.getElementById('about');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero-wrapper">
      {/* 3D Glass Object Centerpiece positioned in center-right */}
      <GlassScene mouse={mouse} scrollProgress={scrollProgress} />

      {/* Hero Foreground Content: Strictly separated layout */}
      <div className="hero-content-grid">

        {/* Main Row: Left Column, Empty Center Negative Space, Right Column */}
        <div className="hero-main-row">

          {/* ================= LEFT COLUMN: Editorial Typography ================= */}
          <div className="hero-left-col">

            {/* Top Micro-label: 01 + line + CLOUD COMMUNITY INNOVATION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>01</span>
              <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--border)' }} />
            </div>

            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.22em', color: 'var(--text-secondary)', textTransform: 'uppercase', lineHeight: 1.6, marginBottom: '28px' }}>
              CLOUD<br />
              COMMUNITY<br />
              INNOVATION
            </div>

            {/* Main Headline with exact hierarchy:
                AWS (Bold, 80px)
                Community (Light, 78px)
                Day (Light, 78px)
                Udaipur '26 (56px, warm amber) */}
            <h1 style={{ display: 'flex', flexDirection: 'column', margin: '0 0 28px 0' }}>
              <span className="hero-title-aws">
                AWS
              </span>
              <span className="hero-title-community">
                Community
              </span>
              <span className="hero-title-day">
                Day
              </span>
              <span className="hero-title-udaipur text-gradient-gold">
                Udaipur '26
              </span>
            </h1>

            {/* Tagline */}
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.22em', color: 'var(--text-secondary)', textTransform: 'uppercase', lineHeight: 1.6, marginBottom: '36px' }}>
              WHERE CLOUD<br />
              MEETS COMMUNITY.
            </div>

            {/* Mobile Registration CTA Upgrade (High Priority Conversion) */}
            <div className="hero-mobile-cta-wrapper">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar style={{ width: '13px', height: '13px', color: '#FF9900' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    OCT 31 2026
                  </span>
                </div>
                <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin style={{ width: '13px', height: '13px', color: '#FF9900' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    UDAIPUR
                  </span>
                </div>
              </div>

              <a
                href={eventData.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-mobile-primary-btn group"
                aria-label="Register for AWS Community Day Udaipur on KonfHub"
              >
                <span>REGISTER ON KONFHUB</span>
                <ArrowUpRight className="hero-mobile-arrow" />
              </a>

              <a
                href="#about"
                onClick={scrollToAbout}
                className="hero-mobile-secondary-link"
              >
                <span>Explore Event ↓</span>
              </a>
            </div>

            {/* Desktop Editorial Explore Button */}
            <div className="hidden lg:block">
              <a
                href="#about"
                onClick={scrollToAbout}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', cursor: 'pointer', width: 'fit-content' }}
                className="group"
              >
                <div
                  className="hero-explore-btn-circle"
                  style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}
                >
                  <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--text-primary)' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Explore Event
                </span>
                <div className="hero-explore-line" style={{ width: '80px', height: '1px', backgroundColor: 'var(--border)', transition: 'all 0.4s ease' }} />
              </a>
            </div>
          </div>

          {/* ================= CENTER: Generous Negative Space for 3D Glass Sculpture ================= */}
          <div className="hero-spacer" />

          {/* ================= RIGHT COLUMN: Event Info & Micro Metadata ================= */}
          <div className="hero-right-col">

            {/* Top Micro-heading */}
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.22em', color: 'var(--text-secondary)', textTransform: 'uppercase', lineHeight: 1.6, marginBottom: '80px' }} className="hidden-mobile">
              SAME CITY<br />
              NEW PERSPECTIVES<br />
              BIGGER IDEAS
            </div>

            {/* Date & Location Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,153,0,0.4)', backgroundColor: 'rgba(255,153,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9900' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  OCT 31 2026
                </div>
              </div>

              {/* Venue */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: '#FF9900' }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, fontWeight: 300 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'block' }}>
                    Geetanjali Institute of
                  </span>
                  Technical Studies, Udaipur
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div style={{ marginTop: '80px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '18px', height: '32px', borderRadius: '9999px', border: '1px solid var(--border)', padding: '4px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '4px', height: '4px', backgroundColor: '#FF9900', borderRadius: '50%' }} className="animate-scroll-pill" />
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', color: 'var(--text-secondary)', textTransform: 'uppercase', lineHeight: 1.3 }}>
                SCROLL TO<br />EXPLORE
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
