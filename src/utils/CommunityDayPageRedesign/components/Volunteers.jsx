
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
  volunteersRow1,
  volunteersRow2,
  volunteersRow3,
} from '../../communityDayData';

gsap.registerPlugin(ScrollTrigger);

// =============================================================================
// LIQUID GLASS VOLUNTEER MARQUEE
// =============================================================================

function VolunteerMarqueeRow({
  items,
  direction = 'left',
  speed = 0.8,
  label = 'Volunteers',
}) {
  const trackRef = useRef(null);
  const xPos = useRef(0);
  const loopWidth = useRef(0);
  const rafId = useRef(null);
  const hovered = useRef(false);

function VolunteerMarqueeRow({ items, direction = 'left', speed = 0.95, offset = 0, label = 'Row' }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const xPos = useRef(offset);
  const singleSetWidth = useRef(0);
  const isHovered = useRef(false);
  const baseSpeed = direction === 'left' ? -speed : speed;
  const repeatCount = 4;

  const displayItems = [
    ...items,
    ...items,
    ...items,
    ...items,
  ];
  const repeatCount = 2;
  const displayItems = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const measure = () => {
      loopWidth.current = track.scrollWidth / repeatCount;
    };

    measure();
    window.addEventListener('resize', measure);
    measureWidth();

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return undefined;
    window.addEventListener('resize', measureWidth);

    let animationFrame = 0;
    const animate = () => {
      const width = loopWidth.current;
      const step = hovered.current ? baseSpeed * 0.38 : baseSpeed;

      xPos.current += step;

      if (width > 0) {
        while (xPos.current <= -width) xPos.current += width;
        while (xPos.current > 0) xPos.current -= width;
      }

      track.style.transform = `translate3d(${xPos.current}px, 0, 0)`;
      rafId.current = requestAnimationFrame(animate);
      animationFrame = requestAnimationFrame(animate);
    };

    const start = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    };
    const stop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };
    const container = containerRef.current;
    const observer =
      container && 'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) start();
            else stop();
          }, { rootMargin: '120px 0px' })
        : null;

    if (observer && container) observer.observe(container);
    else start();

    return () => {
      window.removeEventListener('resize', measure);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', measureWidth);
      observer?.disconnect();
      stop();
    };
  }, [baseSpeed, items.length]);

  return (
    <div
      className="liquid-volunteer-marquee"
      aria-label={`${label} marquee`}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
      ref={containerRef}
      className="marquee-edge-mask select-none py-2"
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
      aria-label={`${label} Marquee`}
    >
      <div ref={trackRef} className="liquid-volunteer-track">
        {displayItems.map((volunteer, index) => {
          const duplicate = index >= items.length;
          const memberNumber =
            (index % 8) + 1;

          return (
            <article
              key={`${volunteer.id ?? volunteer.name}-${index}`}
              className="liquid-volunteer-card"
              aria-hidden={duplicate ? 'true' : undefined}
            >
              {/* Portrait */}
              <div className="liquid-volunteer-image">
                {volunteer.image && (
                  <img
                    src={volunteer.image}
                    alt={
                      duplicate
                        ? ''
                        : `${volunteer.name}, AWS Community Volunteer`
                    }
                    loading={index < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable="false"
                  />
                )}

                <div className="liquid-image-shade" />

                <span className="liquid-member-number">
                  {String(memberNumber).padStart(2, '0')}
                </span>

                <span className="liquid-image-label">
                  AWS COMMUNITY
                </span>
              {/* Circular Avatar */}
              <div className="volunteer-avatar-wrap">
                <img
                  src={volunteer.image}
                  alt={`${volunteer.name}, AWS Community Volunteer`}
                  loading="lazy"
                  decoding="async"
                  className="volunteer-avatar-img"
                  draggable="false"
                />
              </div>

              {/* Glass information panel */}
              <div className="liquid-volunteer-info">
                <div className="liquid-volunteer-kicker">
                  <span className="liquid-status-dot" />
                  VOLUNTEER
                </div>

                <h3 className="liquid-volunteer-name">
                  {volunteer.name}
                </h3>

                <p className="liquid-volunteer-role">
                  {volunteer.role}
                </p>

                <div className="liquid-card-footer">
                  <span>UDAIPUR, INDIA</span>
                  <span className="liquid-card-arrow">↗</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// VOLUNTEERS SECTION
// =============================================================================

export default function Volunteers({
  rows = [volunteersRow1, volunteersRow2, volunteersRow3],
  summary,
}) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const wallRef = useRef(null);

  const allVolunteers = rows.flat();

  const sectionSummary =
    summary ??
    `${String(allVolunteers.length/3).padStart(2, '0')} VOLUNTEERS · COMMUNITY DRIVEN · ONE UNIFIED SPIRIT`;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        wallRef.current,
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wallRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="volunteers"
      ref={sectionRef}
      className="liquid-volunteers-section"
    >
      <style>{`
        .liquid-volunteers-section {
          --liquid-orange: #ff9900;
          position: relative;
          isolation: isolate;
          width: 100%;
          overflow: hidden;
          padding: 48px 0 96px;
          color: #fff;
          background:
            radial-gradient(ellipse at 12% 45%, rgba(255,153,0,.055), transparent 34%),
            radial-gradient(ellipse at 88% 70%, rgba(95,130,180,.055), transparent 32%),
            #030303;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        .liquid-volunteers-section,
        .liquid-volunteers-section * {
          box-sizing: border-box;
        }

        .liquid-volunteers-divider {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 60px;
          padding: 0 24px;
          color: #a1a1aa;
          font: 10px/1.5 monospace;
          letter-spacing: .16em;
        }

        .liquid-volunteers-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg, rgba(255,255,255,.16), transparent
          );
        }

        .liquid-volunteers-inner {
          max-width: 1280px;
          margin: 0 auto 52px;
          padding: 0 48px;
        }

        .liquid-volunteers-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .liquid-volunteers-eyebrow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 17px;
          color: #a1a1aa;
          font: 11px/1.5 monospace;
          letter-spacing: .13em;
        }

        .liquid-volunteers-eyebrow .accent {
          color: var(--liquid-orange);
        }

        .liquid-volunteers-eyebrow .rule {
          width: 32px;
          height: 1px;
          background: rgba(255,255,255,.23);
        }

        .liquid-volunteers-heading {
          margin: 0;
          color: #fafafa;
          font-size: clamp(34px, 5vw, 64px);
          font-weight: 300;
          line-height: 1;
          letter-spacing: -.05em;
        }

        .liquid-volunteers-heading em {
          color: #92929a;
          font-weight: 200;
        }

        .liquid-volunteers-summary {
          max-width: 300px;
          margin: 0;
          color: #a1a1aa;
          font: 10px/1.9 monospace;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        /* Single infinite marquee */
        .liquid-volunteer-marquee {
          width: 100%;
          overflow: hidden;
          padding: 18px 0 24px;
          -webkit-mask-image: linear-gradient(
            to right, transparent, #000 4%, #000 96%, transparent
          );
          mask-image: linear-gradient(
            to right, transparent, #000 4%, #000 96%, transparent
          );
        }

        .liquid-volunteer-track {
          display: flex;
          align-items: stretch;
          gap: 20px;
          width: max-content;
          padding: 4px 0;
          will-change: transform;
        }

        /* Liquid glass card */
        .liquid-volunteer-card {
          position: relative;
          display: flex;
          flex-direction: column;
          flex: 0 0 224px;
          width: 224px;
          overflow: hidden;
          isolation: isolate;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 21px;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,.105),
            rgba(255,255,255,.035) 45%,
            rgba(255,255,255,.065)
          );
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.22),
            inset 1px 0 0 rgba(255,255,255,.07),
            0 12px 36px rgba(0,0,0,.28);
          backdrop-filter: blur(22px) saturate(145%);
          -webkit-backdrop-filter: blur(22px) saturate(145%);
          transition:
            border-color .35s ease,
            box-shadow .35s ease,
            transform .35s cubic-bezier(.2,.7,.2,1);
        }

        /* Moving-looking specular light */
        .liquid-volunteer-card::before {
          content: "";
          position: absolute;
          z-index: 3;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          pointer-events: none;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,.48),
            rgba(255,255,255,.04) 28%,
            transparent 52%,
            rgba(255,153,0,.18) 82%,
            rgba(255,255,255,.17)
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .liquid-volunteer-card::after {
          content: "";
          position: absolute;
          z-index: -1;
          top: -60px;
          right: -70px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(255,153,0,.11);
          filter: blur(48px);
          pointer-events: none;
          transition: opacity .35s ease;
          opacity: .45;
        }

        .liquid-volunteer-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,.36);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.3),
            0 20px 55px rgba(0,0,0,.38),
            0 0 28px rgba(255,153,0,.075);
        }

        .liquid-volunteer-card:hover::after {
          opacity: 1;
        }

        .liquid-volunteer-image {
          position: relative;
          height: 154px;
          overflow: hidden;
          background: linear-gradient(135deg, #242424, #101010);
        }

        .liquid-volunteer-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          transition: transform .65s cubic-bezier(.2,.7,.2,1);
        }

        .liquid-volunteer-card:hover .liquid-volunteer-image img {
          transform: scale(1.055);
        }

        .liquid-image-shade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(115deg, rgba(255,255,255,.13), transparent 32%),
            linear-gradient(to bottom, rgba(0,0,0,.08), transparent 35%, rgba(0,0,0,.54));
        }

        .liquid-member-number {
          position: absolute;
          top: 11px;
          left: 11px;
          padding: 6px 8px;
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 9px;
          color: #fff;
          background: rgba(20,20,20,.35);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          font: 10px/1 monospace;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.16);
        }

        .liquid-image-label {
          position: absolute;
          right: 10px;
          bottom: 10px;
          padding: 6px 8px;
          border: 1px solid rgba(255,255,255,.23);
          border-radius: 7px;
          color: rgba(255,255,255,.88);
          background: rgba(10,10,10,.35);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          font: 8px/1 monospace;
          letter-spacing: .12em;
        }

        .liquid-volunteer-info {
          position: relative;
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: flex-start;
          padding: 15px 15px 13px;
          background: linear-gradient(
            160deg,
            rgba(255,255,255,.055),
            rgba(255,255,255,.012)
          );
        }

        .liquid-volunteer-kicker {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: #c1c1c8;
          font: 9px/1.4 monospace;
          letter-spacing: .1em;
        }

        .liquid-status-dot {
          width: 5px;
          height: 5px;
          flex: 0 0 5px;
          border-radius: 50%;
          background: var(--liquid-orange);
          box-shadow: 0 0 9px rgba(255,153,0,.7);
        }

        .liquid-volunteer-name {
          margin: 0;
          padding-right: 4px;
          color: #fafafa;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .liquid-volunteer-role {
          min-height: 30px;
          margin: 5px 0 15px;
          color: #a7a7b0;
          font-size: 11px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .liquid-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 8px;
          margin-top: auto;
          padding-top: 11px;
          border-top: 1px solid rgba(255,255,255,.1);
          color: #85858e;
          font: 8px/1.5 monospace;
          letter-spacing: .07em;
        }

        .liquid-card-arrow {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 50%;
          color: #ddd;
          background: rgba(255,255,255,.06);
          font-size: 13px;
          transition:
            color .25s ease,
            background .25s ease,
            border-color .25s ease;
        }

        .liquid-volunteer-card:hover .liquid-card-arrow {
          color: #151515;
          background: var(--liquid-orange);
          border-color: var(--liquid-orange);
        }

        @media (min-width: 768px) {
          .liquid-volunteers-divider {
            padding: 0 48px;
            margin-bottom: 64px;
          }

          .liquid-volunteers-header {
            flex-direction: row;
            align-items: flex-end;
          }
        }

        @media (max-width: 480px) {
          .liquid-volunteers-inner {
            padding: 0 24px;
          }

          .liquid-volunteers-divider {
            margin-bottom: 44px;
          }

          .liquid-volunteer-track {
            gap: 14px;
          }

          .liquid-volunteer-card {
            flex-basis: 194px;
            width: 194px;
            border-radius: 18px;
          }

          .liquid-volunteer-image {
            height: 136px;
          }

          .liquid-volunteer-info {
            padding: 13px 12px 12px;
          }

          .liquid-volunteer-name {
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .liquid-volunteer-card,
          .liquid-volunteer-image img,
          .liquid-card-arrow {
            transition: none;
          }
        }

        @supports not (backdrop-filter: blur(1px)) {
          .liquid-volunteer-card {
            background: rgba(28,28,28,.97);
          }
        }
          
      `}</style>

      <div className="liquid-volunteers-divider">
        <span>AWS COMMUNITY DAY / UDAIPUR</span>
      </div>

      <div className="liquid-volunteers-inner">
        <div ref={headerRef} className="liquid-volunteers-header">
          <div>
            <div className="liquid-volunteers-eyebrow">
              <span>05</span>
              <span className="rule" />
              <span className="accent">VOLUNTEERS</span>
              <span>·</span>
              <span>COMMUNITY DRIVEN</span>
            </div>

            <h2 className="liquid-volunteers-heading">
              The community <br />
              <em>behind the community.</em>
            </h2>
          </div>

          <p className="liquid-volunteers-summary">
            {sectionSummary}
          </p>
        </div>
      </div>

      {/* All volunteers in one liquid glass marquee */}
      <div ref={wallRef}>
        <VolunteerMarqueeRow
          items={allVolunteers}
          direction="left"
          speed={0.8}
          label="All Volunteers"
        />
      </div>
    </section>
  );
}
