import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ThemeProvider } from './context/ThemeContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { useLenis } from './hooks/useLenis';
import { useMouse } from './hooks/useMouse';
import CustomCursor from './components/CustomCursor';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Footer from './components/Footer';
import MobileStickyCTA from './components/MobileStickyCTA';
import LoadingScreen from './components/LoadingScreen';
import './styles/globals.css';

// Section 37: Code-splitting non-critical sections to protect initial frame rate
const About = lazy(() => import('./components/About'));
const Speakers = lazy(() => import('./components/Speakers'));
const CoreTeam = lazy(() => import('./components/CoreTeam'));
const Volunteers = lazy(() => import('./components/Volunteers'));
const Schedule = lazy(() => import('./components/Schedule'));
const Venue = lazy(() => import('./components/Venue'));
const Sponsors = lazy(() => import('./components/Sponsors'));
const FAQ = lazy(() => import('./components/FAQ'));
const Registration = lazy(() => import('./components/Registration'));

function AppContent() {
  // Initialize Lenis smooth scroll
  useLenis();

  // Track cursor position for custom cursor & 3D hero reaction
  const mouse = useMouse();

  // Track active section for navigation
  const [activeSection, setActiveSection] = useState('home');

  // Track loader state
  const [isLoading, setIsLoading] = useState(true);

  // Track scroll progress for 3D hero transition
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      scrollProgress.current = Math.min(Math.max(scrollY / windowHeight, 0), 1.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver to highlight current active section in nav
  useEffect(() => {
    const sections = ['home', 'about', 'speakers', 'team', 'volunteers', 'schedule', 'venue', 'sponsors', 'faq', 'register'];
    const observers = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          },
          { threshold: 0.2 }
        );
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Section 31: Layered Hero reveal as the curved wipe begins
  const handleReveal = () => {
    // Navigation drops in subtly from above
    gsap.fromTo(
      '.site-header',
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
    );

    // Hero headline typography rises smoothly
    gsap.fromTo(
      '.hero-left-col',
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out', delay: 0.18 }
    );

    // 3D Crystal Cube expands cleanly
    gsap.fromTo(
      '#hero-3d-canvas-wrap',
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.12 }
    );

    // Event metadata & details fade into place
    gsap.fromTo(
      '.hero-right-col',
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', delay: 0.25 }
    );
  };

  const handleLoadingComplete = () => {
    // Unmount loader completely from DOM
    setIsLoading(false);
  };

  return (
    <div
      className="relative w-full min-h-screen selection:bg-[#FF9900] selection:text-black"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Cinematic White Gallery Door Loading Screen */}
      {isLoading && (
        <LoadingScreen
          onReveal={handleReveal}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* Precision desktop custom cursor */}
      <CustomCursor mouse={mouse} />

      {/* Fixed Navigation Header */}
      <Navigation activeSection={activeSection} />

      {/* Main Sections */}
      <main>
        {/* Critical Hero is mounted and warm under the curtain */}
        <Hero mouse={mouse} scrollProgress={scrollProgress} />

        {/* Deferred lower sections */}
        <Suspense fallback={null}>
          <About />
          <Speakers />
          <CoreTeam />
          <Volunteers />
          <Schedule />
          <Venue />
          <Sponsors />
          <FAQ />
          <Registration />
        </Suspense>
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* Fixed Mobile Conversion Registration Bar */}
      <MobileStickyCTA />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PerformanceProvider>
        <AppContent />
      </PerformanceProvider>
    </ThemeProvider>
  );
}
