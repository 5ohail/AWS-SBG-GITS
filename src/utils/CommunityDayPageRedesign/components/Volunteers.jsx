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
// VOLUNTEER MARQUEE ROW (SMOOTH HORIZONTAL COMMUNITY WALL)
// =============================================================================

function VolunteerMarqueeRow({ items, direction = 'left', speed = 0.95, offset = 0, label = 'Row' }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const xPos = useRef(offset);
  const singleSetWidth = useRef(0);
  const isHovered = useRef(false);
  const baseSpeed = direction === 'left' ? -speed : speed;

  const repeatCount = 2;
  const displayItems = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measureWidth = () => {
      // 1 set is 1/repeatCount of the total scroll width
      singleSetWidth.current = track.scrollWidth / repeatCount;
      if (offset !== 0) {
        xPos.current = offset;
      }
    };

    measureWidth();

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return undefined;
    window.addEventListener('resize', measureWidth);

    let animationFrame = 0;
    const animate = () => {
      const step = isHovered.current ? baseSpeed * 0.4 : baseSpeed;
      xPos.current += step;

      const half = singleSetWidth.current;
      if (half > 0) {
        while (xPos.current <= -half) {
          xPos.current += half;
        }
        while (xPos.current > 0) {
          xPos.current -= half;
        }
      }

      if (track) {
        track.style.transform = `translate3d(${xPos.current}px, 0, 0)`;
      }

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
      window.removeEventListener('resize', measureWidth);
      observer?.disconnect();
      stop();
    };
  }, [baseSpeed, offset]);

  return (
    <div
      ref={containerRef}
      className="marquee-edge-mask select-none py-2"
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
      aria-label={`${label} Marquee`}
    >
      <div
        ref={trackRef}
        className="flex items-center gap-4 sm:gap-6 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {displayItems.map((volunteer, idx) => {
          const isAriaDuplicate = idx >= items.length;
          return (
            <div
              key={`${volunteer.id}-${idx}`}
              className="volunteer-item-card"
              aria-hidden={isAriaDuplicate ? 'true' : 'false'}
            >
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

              {/* Name & Role */}
              <div className="volunteer-info-wrap">
                <span className="volunteer-name">
                  {volunteer.name}
                </span>
                <span className="volunteer-badge">
                  <span className="volunteer-badge-dot" />
                  {volunteer.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN VOLUNTEERS SECTION COMPONENT
// =============================================================================

export default function Volunteers({
  rows = [volunteersRow1, volunteersRow2, volunteersRow3],
  summary = "12 VOLUNTEERS • 3 VENUE TRACKS • 1 UNIFIED SPIRIT",
}) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const wallRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      gsap.fromTo(
        wallRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wallRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="volunteers"
      ref={sectionRef}
      className="relative w-full bg-[#030303] text-white overflow-hidden py-20 md:py-28 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 sm:mb-16">
        {/* =================================================================== */}
        {/* 1. VOLUNTEERS SECTION HEADER                                        */}
        {/* =================================================================== */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono font-medium text-zinc-400">05</span>
              <div className="w-8 h-[1px] bg-white/20" />
              <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
                VOLUNTEERS
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 hidden sm:block" />
              <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase hidden sm:inline">
                COMMUNITY DRIVEN
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light font-display text-white tracking-tight leading-none">
              The community <br />
              <span className="text-zinc-400 font-extralight">behind the community.</span>
            </h2>
          </div>

          <div className="max-w-xs md:text-right font-mono text-xs text-zinc-400">
            {summary}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. THREE ALTERNATING HORIZONTAL MARQUEE ROWS                        */}
      {/* =================================================================== */}
      <div ref={wallRef} className="flex flex-col gap-4 sm:gap-6 w-full">
        {rows.map((items, index) => (
          <VolunteerMarqueeRow
            key={`volunteers-row-${index + 1}`}
            items={items}
            direction={index % 2 === 0 ? "right" : "left"}
            speed={0.95}
            offset={index % 2 === 0 ? 0 : -120 * index}
            label={`Volunteers Row ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
