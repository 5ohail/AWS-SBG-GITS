import React, {
  lazy,
  Suspense,
  useCallback,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import LinkedInIcon from "../../../components/LinkedInIcon";
import { speakersData } from "../../communityDayData";
const SpeakerGallery = lazy(() => import("./SpeakerGallery"));

// =============================================================================
// MAIN CINEMATIC SPEAKERS COMPONENT
// =============================================================================

export default function Speakers({ speakers = speakersData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const containerRef = useRef(null);
  const galleryRef = useRef(null);
  const textContainerRef = useRef(null);
  const hasChangedSlideRef = useRef(false);

  // Transition & Animation Refs
  const isAnimating = useRef(false);
  const progressRef = useRef(0.0);
  const directionRef = useRef(1.0); // +1 = next, -1 = prev
  const parallaxRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(false);
  const dragRef = useRef(0.0);

  // Pointer drag tracking
  const dragStartRef = useRef({ x: 0, time: 0, active: false });

  // Cooldown for trackpad wheel gestures
  const wheelCooldownRef = useRef(false);

  const totalSpeakers = speakers.length;
  const currentSpeaker = speakers[currentIndex];
  const usesPlaceholderGallery = speakers.some(
    (speaker) => speaker.placeholder,
  );

  // ---------------------------------------------------------------------------
  // TRANSITION CONTROLLER (GSAP + GLSL SHADER PROGRESS)
  // ---------------------------------------------------------------------------
  const goToSlide = useCallback((newIndex, direction = 1) => {
    if (isAnimating.current || newIndex === currentIndex) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    isAnimating.current = true;
    directionRef.current = direction;
    setTargetIndex(newIndex);

    // Reset drag displacement
    dragRef.current = 0.0;

    if (prefersReducedMotion) {
      setCurrentIndex(newIndex);
      setTargetIndex(newIndex);
      isAnimating.current = false;
      return;
    }

    const elementsToExit = textContainerRef.current
      ? textContainerRef.current.querySelectorAll(".stagger-text")
      : [];

    const exitDistance = direction > 0 ? -30 : 30;
    const transitionDuration = usesPlaceholderGallery ? 0.38 : 0.85;
    const timeline = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(newIndex);
        setTargetIndex(newIndex);
        progressRef.current = 0;
        isAnimating.current = false;

        const elementsToEnter = textContainerRef.current
          ? textContainerRef.current.querySelectorAll(".stagger-text")
          : [];

        gsap.fromTo(
          elementsToEnter,
          { y: direction > 0 ? 18 : -18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.42,
            stagger: 0.05,
            ease: "power2.out",
          },
        );
      },
    });

    if (galleryRef.current) {
      timeline.to(
        galleryRef.current,
        {
          x: exitDistance,
          scale: 0.94,
          opacity: 0,
          filter: "blur(8px)",
          duration: transitionDuration,
          ease: "power2.in",
        },
        0,
      );
    }

    timeline.to(
      elementsToExit,
      {
        y: direction > 0 ? -18 : 18,
        opacity: 0,
        duration: 0.22,
        stagger: 0.03,
        ease: "power2.in",
      },
      0,
    );
    timeline.fromTo(
      progressRef,
      { current: 0 },
      {
        current: 1,
        duration: transitionDuration,
        ease: "power3.inOut",
      },
      0,
    );
  }, [currentIndex, usesPlaceholderGallery]);

  const handleNext = useCallback(() => {
    const next = (currentIndex + 1) % totalSpeakers;
    goToSlide(next, 1.0);
  }, [currentIndex, goToSlide, totalSpeakers]);

  const handlePrev = useCallback(() => {
    const prev = (currentIndex - 1 + totalSpeakers) % totalSpeakers;
    goToSlide(prev, -1.0);
  }, [currentIndex, goToSlide, totalSpeakers]);

  useEffect(() => {
    if (totalSpeakers < 2) return undefined;

    let autoplayTimer;
    const scheduleNextSpeaker = () => {
      window.clearTimeout(autoplayTimer);
      if (document.visibilityState === "visible") {
        autoplayTimer = window.setTimeout(handleNext, 8000);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleNextSpeaker();
      } else {
        window.clearTimeout(autoplayTimer);
      }
    };

    scheduleNextSpeaker();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearTimeout(autoplayTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentIndex, handleNext, totalSpeakers]);

  useLayoutEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    if (!hasChangedSlideRef.current) {
      hasChangedSlideRef.current = true;
      return;
    }
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.set(gallery, {
        x: 0,
        scale: 1,
        opacity: 1,
        clearProps: "filter",
      });
      return;
    }

    gsap.fromTo(
      gallery,
      {
        x: directionRef.current > 0 ? 30 : -30,
        scale: 0.94,
        opacity: 0,
        filter: "blur(8px)",
      },
      {
        x: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.62,
        ease: "power3.out",
        clearProps: "filter",
      },
    );
  }, [currentIndex]);

  // ---------------------------------------------------------------------------
  // INTERACTIVE GESTURES: POINTER DRAG & VELOCITY TRACKING
  // ---------------------------------------------------------------------------
  const handlePointerDown = (e) => {
    if (isAnimating.current) return;
    dragStartRef.current = {
      x: e.clientX,
      time: performance.now(),
      active: true,
    };
  };

  const handlePointerMove = (e) => {
    // Mouse Parallax inside active container (±10px X, ±6px Y normalized)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      parallaxRef.current = { x: normX, y: -normY };
    }

    if (!dragStartRef.current.active || isAnimating.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    // Normalized drag distance for physical plane resistance
    dragRef.current = Math.min(Math.max(deltaX / window.innerWidth, -0.4), 0.4);
  };

  const handlePointerUp = (e) => {
    if (!dragStartRef.current.active) return;
    dragStartRef.current.active = false;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaTime = performance.now() - dragStartRef.current.time;
    const velocity = deltaX / (deltaTime || 1);

    // Drag threshold: distance > 60px or flick velocity > 0.3
    if (deltaX < -60 || velocity < -0.3) {
      handleNext();
    } else if (deltaX > 60 || velocity > 0.3) {
      handlePrev();
    } else {
      // Snap back smoothly
      gsap.to(dragRef, { current: 0.0, duration: 0.35, ease: "power2.out" });
    }
  };

  // ---------------------------------------------------------------------------
  // KEYBOARD ARROW & TRACKPAD WHEEL NAVIGATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    const handleWheel = (e) => {
      // Horizontal trackpad gesture
      if (
        Math.abs(e.deltaX) > 40 &&
        !wheelCooldownRef.current &&
        !isAnimating.current
      ) {
        wheelCooldownRef.current = true;
        if (e.deltaX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        setTimeout(() => {
          wheelCooldownRef.current = false;
        }, 650);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: true });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleNext, handlePrev]);

  const onHoverChange = (hovering) => {
    hoverRef.current = hovering;
  };

  return (
    <section
      id="speakers"
      className="community-speakers-section relative w-full py-28 md:py-36 bg-[#050505] text-white border-t border-white/5 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* =================================================================== */}
        {/* 1. EDITORIAL SECTION HEADER                                         */}
        {/* =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono font-medium text-zinc-400">
                03
              </span>
              <div className="w-8 h-[1px] bg-white/20" />
              <span className="text-xs font-mono tracking-widest text-[#FF9900] uppercase">
                SPEAKERS
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 hidden sm:block" />
              <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase hidden sm:inline">
                AWS COMMUNITY DAY · UDAIPUR / 26
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light font-display text-white tracking-tight leading-none">
              Meet the people <br className="hidden sm:inline" />
              <span className="text-zinc-400 font-extralight">
                shaping the cloud.
              </span>
            </h2>
          </div>

          {/* Vertical Slide Index Counter */}
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl sm:text-4xl font-light text-[#FF9900] tracking-tight">
              {String(currentIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-base text-zinc-400 font-light">/</span>
            <span className="text-base text-zinc-400 font-light">
              {String(totalSpeakers).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CINEMATIC WEBGL GALLERY VIEWPORT                                */}
        {/* =================================================================== */}
        <div
          ref={containerRef}
          className="community-speakers-viewport relative w-full h-[52vh] sm:h-[58vh] md:h-[66vh] max-h-[640px] rounded-sm overflow-hidden cursor-grab active:cursor-grabbing border border-white/5 bg-[#030303]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Subtle vignette backdrop masks on left & right flanks */}
          <div className="community-speakers-vignette absolute inset-y-0 left-0 w-24 md:w-44 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent z-10 pointer-events-none" />
          <div className="community-speakers-vignette absolute inset-y-0 right-0 w-24 md:w-44 bg-gradient-to-l from-[#050505] via-[#050505]/70 to-transparent z-10 pointer-events-none" />

          {/* Use static cards until every speaker has an image for the WebGL gallery. */}
          {usesPlaceholderGallery ? (
            <div
              ref={galleryRef}
              className="community-speakers-placeholder-gallery"
              aria-hidden="true"
            >
              {[currentIndex - 1, currentIndex, currentIndex + 1].map(
                (index, position) => {
                  const speakerIndex = (index + totalSpeakers) % totalSpeakers;
                  const speaker = speakers[speakerIndex];
                  const initials = speaker.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("");
                  return (
                    <div
                      key={`${speaker.number}-${position}`}
                      className={`community-speakers-placeholder-card ${
                        position === 1 ? "is-active" : ""
                      }${speaker.placeholder ? " is-placeholder" : ""}`}
                    >
                      {speaker.placeholder ? (
                        <span>{initials}</span>
                      ) : (
                        <img
                          src={speaker.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <Suspense fallback={null}>
              <SpeakerGallery
                speakers={speakers}
                currentIndex={currentIndex}
                targetIndex={targetIndex}
                progressRef={progressRef}
                directionRef={directionRef}
                parallaxRef={parallaxRef}
                hoverRef={hoverRef}
                dragRef={dragRef}
                onPrev={handlePrev}
                onNext={handleNext}
                onHoverChange={onHoverChange}
              />
            </Suspense>
          )}

          {/* Minimal Floating Navigation Arrows */}
          <div className="absolute inset-y-0 left-4 md:left-8 flex items-center z-20 pointer-events-none">
            <button
              onClick={handlePrev}
              aria-label="Previous speaker"
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-xs font-mono text-zinc-400 hover:text-white hover:border-[#FF9900]/50 transition-all duration-300 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#FF9900]" />
              <span className="tracking-widest uppercase text-[11px]">
                PREV
              </span>
            </button>
          </div>

          <div className="absolute inset-y-0 right-4 md:right-8 flex items-center z-20 pointer-events-none">
            <button
              onClick={handleNext}
              aria-label="Next speaker"
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-xs font-mono text-zinc-400 hover:text-white hover:border-[#FF9900]/50 transition-all duration-300 group cursor-pointer"
            >
              <span className="tracking-widest uppercase text-[11px]">
                NEXT
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#FF9900]" />
            </button>
          </div>

          {/* Subtle Bottom Card Edge Accent */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            <span>UDAIPUR EDITION / 26</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
              {currentSpeaker.category || "KEYNOTE SESSION"}
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. ACTIVE SPEAKER EDITORIAL TYPOGRAPHY                              */}
        {/* =================================================================== */}
        <div ref={textContainerRef} className="mt-8 md:mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline">
            {/* Left Column: Speaker Identity */}
            <div className="lg:col-span-7">
              <div className="stagger-text text-[11px] font-mono tracking-[0.25em] text-[#FF9900] uppercase mb-1.5">
                SPEAKER {currentSpeaker.number}
              </div>

              <h3 className="stagger-text text-3xl sm:text-4xl md:text-5xl font-display font-light text-white tracking-tight leading-tight">
                {currentSpeaker.name}
              </h3>
              {currentSpeaker.linkedin && (
                <a
                  className="community-speaker-linkedin"
                  href={currentSpeaker.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${currentSpeaker.name}'s LinkedIn profile`}
                  title={`${currentSpeaker.name} on LinkedIn`}
                >
                  <LinkedInIcon size={18} />
                  <span>LinkedIn</span>
                </a>
              )}

              <div className="stagger-text text-sm sm:text-base font-normal text-zinc-300 tracking-wide mt-2 flex flex-wrap items-center gap-2">
                <span>{currentSpeaker.role}</span>
                {currentSpeaker.company && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[#FF9900] font-medium">
                      {currentSpeaker.company}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Session Topic & Tags */}
            <div className="lg:col-span-5 flex flex-col justify-end">
              <div className="stagger-text text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-1">
                SESSION FOCUS
              </div>
              <p className="stagger-text text-sm md:text-base font-light text-zinc-300 leading-snug">
                {currentSpeaker.topic ||
                  "Session details will be announced soon."}
              </p>

              {/* Architectural Topic Tags */}
              <div className="stagger-text flex flex-wrap gap-2 mt-4">
                {currentSpeaker.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded text-[10px] font-mono tracking-wider bg-white/[0.04] border border-white/10 text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. PROGRESS BAR & INTERACTION FOOTER                                */}
        {/* =================================================================== */}
        <div className="mt-10 pt-6 border-t border-white/5">
          {/* Thin 2px AWS Orange Progress Line */}
          <div className="relative w-full h-[2px] bg-white/10 overflow-hidden mb-5">
            <div
              className="absolute top-0 left-0 h-full bg-[#FF9900] transition-all duration-500 ease-out"
              style={{
                width: `${((currentIndex + 1) / totalSpeakers) * 100}%`,
              }}
            />
          </div>

          {/* Minimal Interaction Hints */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-400 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[#FF9900]">●</span>
              <span>DRAG / ARROW KEYS TO EXPLORE</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="hidden md:inline text-zinc-400">
                CLOUD · COMMUNITY · INNOVATION
              </span>
              <div className="flex items-center gap-2">
                {speakers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                    aria-label={`Jump to speaker ${idx + 1}`}
                    className={`w-6 h-1 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "bg-[#FF9900] w-8"
                        : "bg-white/15 hover:bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
