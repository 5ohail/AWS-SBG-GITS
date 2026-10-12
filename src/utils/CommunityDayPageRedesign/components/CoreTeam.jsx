
import React, { useRef, useEffect } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import LinkedInIcon from '../../../components/LinkedInIcon';
import { coreTeam } from '../../communityDayData';

gsap.registerPlugin(ScrollTrigger);

// =============================================================================
// INTERACTIVE PHYSICS MARQUEE
// Drag + inertia + seamless infinite loop
// =============================================================================

function InteractiveMarqueeRow({
  items,
  direction = 'left',
  speed = 0.85,
  initialOffset = 0,
  rowLabel = 'CORE TEAM',
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
    if (!track || items.length === 0) return;

    const measureWidth = () => {
      singleSetWidth.current = track.scrollWidth / repeatCount;

      if (initialOffset !== 0) {
        xPos.current = initialOffset;
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);

    const animate = () => {
      const loopWidth = singleSetWidth.current;

      if (!isDragging.current) {
        if (Math.abs(velocity.current) > 0.05) {
          xPos.current += velocity.current;
          velocity.current *= 0.94;
        } else {
          const targetSpeed = isHovered.current
            ? baseSpeed * 0.38
            : baseSpeed;

          currentSpeed.current +=
            (targetSpeed - currentSpeed.current) * 0.06;

          xPos.current += currentSpeed.current;
        }
      }

      // Keep the marquee loop seamless.
      if (loopWidth > 0) {
        while (xPos.current <= -loopWidth) {
          xPos.current += loopWidth;
        }

        while (xPos.current > 0) {
          xPos.current -= loopWidth;
        }
      }

      if (track) {
        track.style.transform =
          `translate3d(${xPos.current}px, 0, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', measureWidth);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [baseSpeed, initialOffset, items.length]);

  // ---------------------------------------------------------------------------
  // Pointer drag handlers
  // ---------------------------------------------------------------------------

  const handlePointerDown = (event) => {
    isDragging.current = true;
    lastX.current = event.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging.current) return;

    const now = performance.now();
    const deltaTime = Math.max(now - lastTime.current, 1);
    const deltaX = event.clientX - lastX.current;

    xPos.current += deltaX;
    velocity.current = (deltaX / deltaTime) * 16.6;

    lastX.current = event.clientX;
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
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        isHovered.current = false;
      }}
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      aria-label={`${rowLabel} Marquee`}
      style={{ touchAction: 'pan-y' }}
    >
      <div
        ref={trackRef}
        className="flex items-start gap-6 sm:gap-8 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {displayItems.map((member, index) => {
          const isDuplicate = index >= items.length;

          return (
            <article
              key={`${member.id ?? member.name}-${index}`}
              className="team-portrait-card"
              aria-hidden={isDuplicate ? 'true' : undefined}
            >
              {/* Member portrait */}
              <div className="team-image-container">
                {member.image && (
                  <img
                    src={member.image}
                    alt={
                      isDuplicate
                        ? ''
                        : `${member.name}, AWS Community Day Udaipur Core Team`
                    }
                    loading={index < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="team-portrait-img"
                    draggable="false"
                  />
                )}

                {/* Ambient image vignette */}
                <div className="team-image-vignette" />

                {/* Hover indicator */}
                <div className="team-hover-tag">
                  <span className="team-tag-dot" />
                  <span className="team-tag-text">CORE TEAM</span>
                </div>
              </div>

              {/* Member details */}
              <div className="team-meta-container">
                <h3 className="team-member-name">
                  {member.name}
                </h3>

                <p className="team-member-role">
                  {member.role}
                </p>

                {member.linkedin && (
                  <a
                    className="team-member-linkedin"
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${member.name}'s LinkedIn profile`}
                    title={`${member.name} on LinkedIn`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <LinkedInIcon size={16} />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN CORE TEAM SECTION
// All members appear in ONE continuous horizontal row.
// =============================================================================

export default function CoreTeam({ rows = [coreTeam] }) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const marqueeContainerRef = useRef(null);

  // Combine all incoming rows into one list of members.
  const allMembers = rows.flat();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal the section heading.
      gsap.fromTo(
        headerRef.current,
        {
          opacity: 0,
          y: 50,
        },
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

      // Reveal the single marquee.
      gsap.fromTo(
        marqueeContainerRef.current,
        {
          opacity: 0,
          y: 70,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: marqueeContainerRef.current,
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
      id="team"
      ref={sectionRef}
      className="relative w-full bg-[#030303] text-white overflow-hidden pt-12 pb-24 md:pb-36"
    >
      {/* ================================================================= */}
      {/* 1. EDITORIAL SECTION DIVIDER                                     */}
      {/* ================================================================= */}

      <div className="section-editorial-divider">
        <span>AWS COMMUNITY DAY / UDAIPUR</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-14 md:mb-20">
        {/* =============================================================== */}
        {/* 2. CORE TEAM HEADING                                            */}
        {/* =============================================================== */}

        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono font-medium text-zinc-400">
                04
              </span>

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

          {/* Right editorial note */}
          <div className="max-w-xs md:text-right">
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider leading-relaxed">
              {String(allMembers.length).padStart(2, '0')} CORE ORGANIZERS
              {' · '}BUILT FOR BUILDERS
              {' · '}100% COMMUNITY VOLUNTARY
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. SINGLE CONTINUOUS MARQUEE                                      */}
      {/* ================================================================= */}

      <div
        ref={marqueeContainerRef}
        className="w-full"
      >
        <InteractiveMarqueeRow
          items={allMembers}
          direction="left"
          speed={0.8}
          initialOffset={0}
          rowLabel="Core Team"
        />
      </div>
    </section>
  );
}
