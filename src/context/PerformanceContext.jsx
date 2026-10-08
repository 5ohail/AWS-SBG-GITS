import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PerformanceContext = createContext({
  tier: 'high',
  pixelRatio: 2,
  enableParticles: true,
  enableAberration: true,
  simplifiedShaders: false,
  isDocumentVisible: true,
  prefersReducedMotion: false
});

/**
 * Detects hardware & connection capabilities and assigns a performance tier:
 * - HIGH: Modern multi-core desktop / flagship mobile
 * - MEDIUM: Mainstream laptops & mid-range mobile
 * - LOW: Budget devices, low memory, or slow network (2G/3G)
 */
function detectDeviceTier() {
  if (typeof window === 'undefined') {
    return { tier: 'high', pixelRatio: 2 };
  }

  // 1. Respect user's reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 2. Hardware metrics
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // GB RAM (if supported)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = connection?.effectiveType || '4g';
  const isMobile = window.innerWidth < 768;
  const dpr = window.devicePixelRatio || 1;

  // Slow network automatically assigns LOW tier
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g') {
    return { tier: 'low', pixelRatio: 1, prefersReduced };
  }

  // Low hardware (<= 2 cores, <= 2GB RAM)
  if (cores <= 2 || memory <= 2) {
    return { tier: 'low', pixelRatio: 1, prefersReduced };
  }

  // Mid-range mobile or 4-core device
  if (isMobile && (cores <= 4 || memory <= 4)) {
    return { tier: 'medium', pixelRatio: Math.min(dpr, 1.5), prefersReduced };
  }

  if (cores <= 4 && memory <= 4) {
    return { tier: 'medium', pixelRatio: Math.min(dpr, 1.5), prefersReduced };
  }

  // High tier desktop / high-end mobile
  return {
    tier: 'high',
    pixelRatio: Math.min(dpr, 2),
    prefersReduced
  };
}

export function PerformanceProvider({ children }) {
  const [capabilities, setCapabilities] = useState(() => detectDeviceTier());
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  // FPS monitor with hysteresis
  const frameTimes = useRef([]);
  const lastTime = useRef(performance.now());
  const lowFpsCount = useRef(0);
  const highFpsCount = useRef(0);

  // Monitor visibility changes to pause heavy animations
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Lightweight FPS Monitor (only active when page is visible)
  useEffect(() => {
    if (!isDocumentVisible || capabilities.tier === 'low') return;

    let rafId;
    const measure = (now) => {
      const delta = now - lastTime.current;
      lastTime.current = now;

      if (delta > 0 && delta < 150) {
        const fps = 1000 / delta;
        frameTimes.current.push(fps);
        if (frameTimes.current.length > 60) {
          frameTimes.current.shift();
        }

        if (frameTimes.current.length >= 45) {
          const avgFps =
            frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;

          // If FPS stays below 38 for consecutive windows, downgrade tier
          if (avgFps < 38) {
            lowFpsCount.current += 1;
            if (lowFpsCount.current > 3) {
              setCapabilities((prev) => {
                if (prev.tier === 'high') {
                  return { ...prev, tier: 'medium', pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5) };
                }
                if (prev.tier === 'medium') {
                  return { ...prev, tier: 'low', pixelRatio: 1 };
                }
                return prev;
              });
              lowFpsCount.current = 0;
              frameTimes.current = [];
            }
          } else {
            lowFpsCount.current = 0;
          }

          // If FPS stays above 56 consistently on medium, can restore to high
          if (avgFps > 56 && capabilities.tier === 'medium') {
            highFpsCount.current += 1;
            if (highFpsCount.current > 6) {
              setCapabilities((prev) => ({
                ...prev,
                tier: 'high',
                pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
              }));
              highFpsCount.current = 0;
            }
          } else {
            highFpsCount.current = 0;
          }
        }
      }

      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [isDocumentVisible, capabilities.tier]);

  const value = {
    tier: capabilities.tier,
    pixelRatio: capabilities.pixelRatio,
    enableParticles: capabilities.tier !== 'low' && !capabilities.prefersReduced,
    enableAberration: capabilities.tier === 'high',
    simplifiedShaders: capabilities.tier === 'low',
    isDocumentVisible,
    prefersReducedMotion: capabilities.prefersReduced
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  return useContext(PerformanceContext);
}
