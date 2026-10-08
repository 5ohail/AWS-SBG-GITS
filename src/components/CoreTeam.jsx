import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coreTeamRow1, coreTeamRow2 } from '../data/team';

gsap.registerPlugin(ScrollTrigger);

// =============================================================================
// INTERACTIVE PHYSICS MARQUEE ROW (DRAG + INERTIA + SEAMLESS LOOP)
// =============================================================================

function InteractiveMarqueeRow({
  items,
  direction = 'left',
  speed = 0.85,
  initialOffset = 0,
  rowLabel = 'ROW'
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const xPos = useRef(initialOffset);
  const baseSpeed = direction === 'left' ? -speed : speed;
  const currentSpeed = useRef(baseSpeed);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const isHovered = useRef(false);
  const rafId = useRef(null);
  const singleSetWidth = useRef(0);

  const repeatCount = 4;
  const displayItems = [...items, ...items, ...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measureWidth = () => {
      // The length of 1 set of items is 1/repeatCount of the total scroll width
      singleSetWidth.current = track.scrollWidth / repeatCount;
      if (initialOffset !== 0) {
        xPos.current = initialOffset;
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);

    // Main 60/120fps physics loop
    const animate = () => {
      const half = singleSetWidth.current;

      if (!isDragging.current) {
        if (Math.abs(velocity.current) > 0.05) {
          // Inertia decay: velocity *= 0.94 as specified in requirements
          xPos.current += velocity.current;
          velocity.current *= 0.94;
        } else {
          // Return smoothly to automatic marquee speed (or 0.38x on hover)
          const target = isHovered.current ? baseSpeed * 0.38 : baseSpeed;
          currentSpeed.current += (target - currentSpeed.current) * 0.06;
          xPos.current += currentSpeed.current;
        }
      }

      // Seamless infinite wrapping without visible jumps
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

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', measureWidth);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [baseSpeed, initialOffset]);

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const now = performance.now();
    const dt = Math.max(now - lastTime.current, 1);
    const dx = e.clientX - lastX.current;
    
    xPos.current += dx;
    velocity.current = (dx / dt) * 16.6; // normalized velocity
    
    lastX.current = e.clientX;
    lastTime.current = now;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="marquee-edge-mask cursor-grab active:cursor-grabbing select-none py-3"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        isHovered.current = false;
      }}
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      aria-label={`${rowLabel} Marquee`}
    >
      <div
        ref={trackRef}
        className="flex items-start gap-6 sm:gap-8 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {displayItems.map((member, idx) => {
          const isAriaDuplicate = idx >= items.length;
          return (
            <article
              key={`${member.id}-${idx}`}
              className="team-portrait-card"
              aria-hidden={isAriaDuplicate ? 'true' : 'false'}
            >
              {/* 4:5 Portrait Image Container */}
              <div className="team-image-container">
                <img
                  src={member.image}
                  alt={`${member.name}, AWS Community Day Udaipur Core Team`}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="team-portrait-img"
                  draggable="false"
                />

                {/* Ambient dark edge vignette */}
                <div className="team-image-vignette" />

                {/* Hover indicator: subtle orange metadata dot */}
                <div className="team-hover-tag">
                  <span className="team-tag-dot" />
                  <span className="team-tag-text">CORE TEAM</span>
                </div>
              </div>

              {/* Member Typography */}
              <div className="team-meta-container">
                <h3 className="team-member-name">
                  {member.name}
                </h3>
                <p className="team-member-role">
                  {member.role}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN CORE TEAM SECTION COMPONENT
// =============================================================================

export default function CoreTeam() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const marqueeContainerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ScrollTrigger reveal for section header
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // ScrollTrigger reveal for marquee rows
      gsap.fromTo(
        marqueeContainerRef.current,
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: marqueeContainerRef.current,
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
      id="team"
      ref={sectionRef}
      className="relative w-full bg-[#030303] text-white overflow-hidden pt-12 pb-24 md:pb-36"
    >
      {/* =================================================================== */}
      {/* 1. EDITORIAL SECTION DIVIDER (BETWEEN SPEAKERS & CORE TEAM)         */}
      {/* =================================================================== */}
      <div className="section-editorial-divider">
        <span>AWS COMMUNITY DAY / UDAIPUR</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-14 md:mb-20">
        {/* =================================================================== */}
        {/* 2. CORE TEAM HERO / EDITORIAL HEADING                               */}
        {/* =================================================================== */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono font-medium text-zinc-400">04</span>
              <div className="w-8 h-[1px] bg-white/20" />
              <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
                CORE TEAM
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 hidden sm:block" />
              <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase hidden sm:inline">
                AWS USER GROUP UDAIPUR
              </span>
            </div>

            <h2 className="core-team-heading">
              The people <br />
              <em>behind the experience.</em>
            </h2>
          </div>

          {/* Right Editorial Note */}
          <div className="max-w-xs md:text-right">
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider leading-relaxed">
              07 CORE ORGANIZERS · BUILT FOR BUILDERS · 100% COMMUNITY VOLUNTARY
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. TWO-ROW OPPOSITE-DIRECTION CONTINUOUS MARQUEE WALL               */}
      {/* =================================================================== */}
      <div ref={marqueeContainerRef} className="flex flex-col gap-8 md:gap-12 w-full">
        {/* Row 01: Moves Left ← */}
        <InteractiveMarqueeRow
          items={coreTeamRow1}
          direction="left"
          speed={0.8}
          initialOffset={0}
          rowLabel="Core Team Row 1"
        />

        {/* Row 02: Moves Right → with Offset */}
        <InteractiveMarqueeRow
          items={coreTeamRow2}
          direction="right"
          speed={0.8}
          initialOffset={-180}
          rowLabel="Core Team Row 2"
        />
      </div>
    </section>
  );
}
