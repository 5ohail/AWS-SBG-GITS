/**
 * AWS COMMUNITY DAY UDAIPUR '26 — CENTRALIZED ANIMATION CONFIGURATION
 * 
 * Defines standardized easings, durations, and motion presets for GSAP & CSS.
 */

export const EASINGS = {
  curtain: "power4.inOut",
  editorialIn: "power3.out",
  editorialOut: "power2.in",
  smoothDecel: "power2.out",
  elasticGentle: "elastic.out(1, 0.75)"
};

export const DURATIONS = {
  micro: 0.25,
  fast: 0.45,
  standard: 0.75,
  deliberate: 1.05,
  curtainWipe: 1.15
};

export const MOTION_PRESETS = {
  // Editorial line-by-line reveal
  lineReveal: {
    y: 32,
    opacity: 0,
    duration: 0.85,
    ease: "power3.out"
  },
  // Pill transformation preset
  pillTransform: {
    scale: 0.94,
    opacity: 0,
    duration: 0.65,
    ease: "power2.out"
  },
  // Stagger default
  stagger: 0.08
};
