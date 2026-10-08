import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { speakersData } from '../data/speakers';
import { speakerVertexShader, speakerFragmentShader } from '../shaders/speakerTransitionShader';

// =============================================================================
// 1. WEBGL SPEAKER PLANE WITH CHROMATIC GLITCH SHADER
// =============================================================================

function ActiveSpeakerPlane({
  texture,
  nextTexture,
  progressRef,
  directionRef,
  parallaxRef,
  hoverRef,
  dragRef,
  onPointerOver,
  onPointerOut
}) {
  const meshRef = useRef();

  const uniforms = useMemo(() => ({
    uCurrentTexture: { value: texture },
    uNextTexture: { value: nextTexture || texture },
    uProgress: { value: 0.0 },
    uDirection: { value: 1.0 },
    uDistortion: { value: 1.2 },
    uChromatic: { value: 1.4 },
    uGlitch: { value: 1.0 },
    uTime: { value: 0.0 },
    uParallax: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0.0 },
    uOpacity: { value: 1.0 },
    uIsActive: { value: 1.0 }
  }), []);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uCurrentTexture.value = texture;
      meshRef.current.material.uniforms.uNextTexture.value = nextTexture || texture;
    }
  }, [texture, nextTexture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    const t = state.clock.elapsedTime;

    mat.uniforms.uTime.value = t;
    mat.uniforms.uProgress.value = progressRef.current;
    mat.uniforms.uDirection.value = directionRef.current;

    // Smooth mouse parallax interpolation
    mat.uniforms.uParallax.value.x = THREE.MathUtils.lerp(
      mat.uniforms.uParallax.value.x,
      parallaxRef.current.x,
      0.08
    );
    mat.uniforms.uParallax.value.y = THREE.MathUtils.lerp(
      mat.uniforms.uParallax.value.y,
      parallaxRef.current.y,
      0.08
    );

    // Smooth hover factor
    mat.uniforms.uHover.value = THREE.MathUtils.lerp(
      mat.uniforms.uHover.value,
      hoverRef.current ? 1.0 : 0.0,
      0.1
    );

    // Dynamic horizontal drag displacement
    const targetX = dragRef.current * 1.8;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.15
    );

    // Digital/cinematic glitch & chroma in dark exhibition mode
    const targetChroma = 1.4;
    const targetGlitch = 1.0;
    mat.uniforms.uChromatic.value = THREE.MathUtils.lerp(mat.uniforms.uChromatic.value, targetChroma, 0.08);
    mat.uniforms.uGlitch.value = THREE.MathUtils.lerp(mat.uniforms.uGlitch.value, targetGlitch, 0.08);

    // Micro-scale hover effect (1.00 -> 1.015)
    const targetScale = hoverRef.current ? 1.015 : 1.0;
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={[2.85, 3.65, 32, 32]} />
      <shaderMaterial
        vertexShader={speakerVertexShader}
        fragmentShader={speakerFragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
}

// =============================================================================
// 2. NEIGHBORING SPEAKER PREVIEW PLANES (LEFT & RIGHT EDGES)
// =============================================================================

function NeighborSpeakerPlane({
  texture,
  positionX,
  scale = 0.78,
  dragRef,
  onClick
}) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    const targetX = positionX + dragRef.current * 1.4;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.15
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={[positionX, 0, -0.4]}
      scale={[scale, scale, scale]}
      onClick={onClick}
    >
      <planeGeometry args={[2.85, 3.65]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        opacity={0.38}
        color="#888888"
      />
    </mesh>
  );
}

// =============================================================================
// 3. THREE.JS GALLERY SCENE CONTAINER
// =============================================================================

function SpeakerGalleryScene({
  currentIndex,
  targetIndex,
  progressRef,
  directionRef,
  parallaxRef,
  hoverRef,
  dragRef,
  onPrev,
  onNext,
  onHoverChange
}) {
  // Load all 6 speaker textures into cache
  const imagePaths = useMemo(() => speakersData.map((s) => s.image), []);
  const textures = useLoader(THREE.TextureLoader, imagePaths);

  useEffect(() => {
    textures.forEach((tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
    });
  }, [textures]);

  const count = speakersData.length;
  const prevIdx = (currentIndex - 1 + count) % count;
  const nextIdx = (currentIndex + 1) % count;

  return (
    <group position={[0, 0, 0]}>
      {/* Previous Speaker Plane (Left Flank) */}
      <NeighborSpeakerPlane
        texture={textures[prevIdx]}
        positionX={-3.35}
        dragRef={dragRef}
        onClick={onPrev}
      />

      {/* Active Speaker Plane (Dominant Centerpiece) */}
      <ActiveSpeakerPlane
        texture={textures[currentIndex]}
        nextTexture={textures[targetIndex]}
        progressRef={progressRef}
        directionRef={directionRef}
        parallaxRef={parallaxRef}
        hoverRef={hoverRef}
        dragRef={dragRef}
        onPointerOver={() => onHoverChange(true)}
        onPointerOut={() => onHoverChange(false)}
      />

      {/* Next Speaker Plane (Right Flank) */}
      <NeighborSpeakerPlane
        texture={textures[nextIdx]}
        positionX={3.35}
        dragRef={dragRef}
        onClick={onNext}
      />
    </group>
  );
}

// =============================================================================
// 4. ELEGANT DARK FALLBACK CARD
// =============================================================================

function SpeakerFallback({ speaker }) {
  const initials = speaker.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#070707] border border-white/10 rounded-sm p-8 text-center">
      <div>
        <div className="text-6xl font-light font-display text-zinc-600 mb-4 tracking-wider">
          {initials}
        </div>
        <div className="text-lg font-medium text-white mb-1">{speaker.name}</div>
        <div className="text-xs font-mono text-[#FF9900] uppercase tracking-widest mb-4">
          {speaker.company}
        </div>
        <div className="w-8 h-[1px] bg-[#FF9900] mx-auto" />
      </div>
    </div>
  );
}

// =============================================================================
// 5. MAIN CINEMATIC SPEAKERS COMPONENT
// =============================================================================

export default function Speakers() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef(null);
  const textContainerRef = useRef(null);

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

  const totalSpeakers = speakersData.length;
  const currentSpeaker = speakersData[currentIndex];

  // ---------------------------------------------------------------------------
  // TRANSITION CONTROLLER (GSAP + GLSL SHADER PROGRESS)
  // ---------------------------------------------------------------------------
  const goToSlide = (newIndex, direction = 1) => {
    if (isAnimating.current || newIndex === currentIndex) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    isAnimating.current = true;
    directionRef.current = direction;
    setTargetIndex(newIndex);

    // Reset drag displacement
    dragRef.current = 0.0;

    if (prefersReducedMotion) {
      // Instant switch with gentle opacity fade
      setCurrentIndex(newIndex);
      isAnimating.current = false;
      return;
    }

    // 1. Staggered Exit Animation for Typography
    const elementsToExit = textContainerRef.current
      ? textContainerRef.current.querySelectorAll('.stagger-text')
      : [];

    gsap.to(elementsToExit, {
      y: direction > 0 ? -18 : 18,
      opacity: 0,
      duration: 0.22,
      stagger: 0.03,
      ease: 'power2.in'
    });

    // 2. Animate Shader Progress (0.0 -> 1.0)
    gsap.fromTo(
      progressRef,
      { current: 0.0 },
      {
        current: 1.0,
        duration: 0.85,
        ease: 'power3.inOut',
        onComplete: () => {
          // Transition complete: lock new index and return to idle
          setCurrentIndex(newIndex);
          setTargetIndex(newIndex);
          progressRef.current = 0.0;
          isAnimating.current = false;

          // 3. Staggered Entrance Animation for New Typography
          const elementsToEnter = textContainerRef.current
            ? textContainerRef.current.querySelectorAll('.stagger-text')
            : [];

          gsap.fromTo(
            elementsToEnter,
            { y: direction > 0 ? 18 : -18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.42,
              stagger: 0.05,
              ease: 'power2.out'
            }
          );
        }
      }
    );
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % totalSpeakers;
    goToSlide(next, 1.0);
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + totalSpeakers) % totalSpeakers;
    goToSlide(prev, -1.0);
  };

  // ---------------------------------------------------------------------------
  // INTERACTIVE GESTURES: POINTER DRAG & VELOCITY TRACKING
  // ---------------------------------------------------------------------------
  const handlePointerDown = (e) => {
    if (isAnimating.current) return;
    dragStartRef.current = {
      x: e.clientX,
      time: performance.now(),
      active: true
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
      gsap.to(dragRef, { current: 0.0, duration: 0.35, ease: 'power2.out' });
    }
  };

  // ---------------------------------------------------------------------------
  // KEYBOARD ARROW & TRACKPAD WHEEL NAVIGATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    const handleWheel = (e) => {
      // Horizontal trackpad gesture
      if (Math.abs(e.deltaX) > 40 && !wheelCooldownRef.current && !isAnimating.current) {
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

    window.addEventListener('keydown', handleKeyDown);
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: true });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex]);

  const onHoverChange = (hovering) => {
    hoverRef.current = hovering;
    setIsHovered(hovering);
  };

  return (
    <section
      id="speakers"
      className="relative w-full py-28 md:py-36 bg-[#050505] text-white border-t border-white/5 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* =================================================================== */}
        {/* 1. EDITORIAL SECTION HEADER                                         */}
        {/* =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono font-medium text-zinc-400">03</span>
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
              <span className="text-zinc-400 font-extralight">shaping the cloud.</span>
            </h2>
          </div>

          {/* Vertical Slide Index Counter */}
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl sm:text-4xl font-light text-[#FF9900] tracking-tight">
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-base text-zinc-400 font-light">/</span>
            <span className="text-base text-zinc-400 font-light">
              {String(totalSpeakers).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CINEMATIC WEBGL GALLERY VIEWPORT                                */}
        {/* =================================================================== */}
        <div
          ref={containerRef}
          className="relative w-full h-[52vh] sm:h-[58vh] md:h-[66vh] max-h-[640px] rounded-sm overflow-hidden cursor-grab active:cursor-grabbing border speaker-viewport-container"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Subtle vignette backdrop masks on left & right flanks */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-44 speaker-flank-mask-left z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-44 speaker-flank-mask-right z-10 pointer-events-none" />

          {/* Three.js Canvas with 3D Gallery Planes */}
          <Canvas
            camera={{ position: [0, 0, 5.8], fov: 38 }}
            dpr={[1, Math.min(window.devicePixelRatio, 2)]}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: true
            }}
          >
            <Suspense fallback={null}>
              <SpeakerGalleryScene
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
          </Canvas>

          {/* Minimal Floating Navigation Arrows */}
          <div className="absolute inset-y-0 left-4 md:left-8 flex items-center z-20 pointer-events-none">
            <button
              onClick={handlePrev}
              aria-label="Previous speaker"
              className="speaker-nav-btn pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full border backdrop-blur-md text-xs font-mono transition-all duration-300 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#FF9900]" />
              <span className="tracking-widest uppercase text-[11px]">PREV</span>
            </button>
          </div>

          <div className="absolute inset-y-0 right-4 md:right-8 flex items-center z-20 pointer-events-none">
            <button
              onClick={handleNext}
              aria-label="Next speaker"
              className="speaker-nav-btn pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full border backdrop-blur-md text-xs font-mono transition-all duration-300 group cursor-pointer"
            >
              <span className="tracking-widest uppercase text-[11px]">NEXT</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#FF9900]" />
            </button>
          </div>

          {/* Subtle Bottom Card Edge Accent */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between z-20 pointer-events-none text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            <span>UDAIPUR EDITION / 26</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
              KEYNOTE SESSION
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

              <div className="stagger-text text-sm sm:text-base font-normal text-zinc-300 tracking-wide mt-2 flex flex-wrap items-center gap-2">
                <span>{currentSpeaker.role}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-[#FF9900] font-medium">{currentSpeaker.company}</span>
              </div>
            </div>

            {/* Right Column: Session Topic & Tags */}
            <div className="lg:col-span-5 flex flex-col justify-end">
              <div className="stagger-text text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-1">
                SESSION FOCUS
              </div>
              <p className="stagger-text text-sm md:text-base font-light text-zinc-300 leading-snug">
                {currentSpeaker.topic}
              </p>

              {/* Architectural Topic Tags */}
              <div className="stagger-text flex flex-wrap gap-2 mt-4">
                {currentSpeaker.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="speaker-topic-tag px-2.5 py-1 rounded text-[10px] font-mono tracking-wider bg-white/[0.04] border border-white/10 text-zinc-300"
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
                width: `${((currentIndex + 1) / totalSpeakers) * 100}%`
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
                {speakersData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                    aria-label={`Jump to speaker ${idx + 1}`}
                    className={`w-6 h-1 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'bg-[#FF9900] w-8'
                        : 'bg-white/15 hover:bg-white/30'
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
