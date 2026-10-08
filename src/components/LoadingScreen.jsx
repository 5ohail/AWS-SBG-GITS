import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { loadCriticalAssets, isReturningVisitor, markAsLoaded, startDeferredAssets } from '../utils/loadingManager';

const MESSAGES = [
  'Hello',
  'Namaste',
  'Welcome to Udaipur',
  'AWS Community Day',
  "Udaipur '26"
];

export default function LoadingScreen({ onReveal, onComplete }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const textRef = useRef(null);
  const pathRef = useRef(null);
  const statusDotRef = useRef(null);

  const [messageIndex, setMessageIndex] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING');
  const isExiting = useRef(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isReturning = isReturningVisitor();

    // Start critical assets loading in parallel with animation rhythm
    const criticalPromise = loadCriticalAssets();

    // Visual rhythm timings per message
    // Returning: ~180-220ms, First visit: ~380-450ms
    const stepDuration = isReturning ? 240 : 420;
    let currentIndex = 0;
    let timeoutId;

    const animateTextTransition = (nextIdx, callback) => {
      if (!textRef.current || isExiting.current) return;

      if (prefersReducedMotion) {
        setMessageIndex(nextIdx);
        if (callback) callback();
        return;
      }

      // Exit current message
      gsap.to(textRef.current, {
        opacity: 0,
        y: -12,
        filter: 'blur(4px)',
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          setMessageIndex(nextIdx);
          // Enter new message
          gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 12, filter: 'blur(4px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.32,
              ease: 'power2.out',
              onComplete: callback
            }
          );
        }
      });
    };

    const triggerExitWipe = () => {
      if (isExiting.current) return;
      isExiting.current = true;

      setStatusText('READY');
      if (statusDotRef.current) {
        statusDotRef.current.style.backgroundColor = '#FF9900';
      }

      // Trigger layered hero reveal underneath as the wipe starts
      if (onReveal) {
        onReveal();
      }

      // Fade out loader text and metadata quickly
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -18,
        duration: 0.3,
        ease: 'power2.out'
      });

      if (prefersReducedMotion) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            markAsLoaded();
            startDeferredAssets();
            if (onComplete) onComplete();
          }
        });
        return;
      }

      // Parabolic curve morph for physical tension-and-release
      const curveObj = { curveY: 260 };
      gsap.to(curveObj, {
        curveY: 0,
        duration: 1.15,
        ease: 'power4.inOut',
        onUpdate: () => {
          if (pathRef.current) {
            pathRef.current.setAttribute(
              'd',
              `M 0,0 L 1440,0 L 1440,0 Q 720,${curveObj.curveY} 0,0 Z`
            );
          }
        }
      });

      // Slide the entire warm white loader curtain upward with power4.inOut
      gsap.to(containerRef.current, {
        yPercent: -130,
        duration: 1.1,
        ease: 'power4.inOut',
        onComplete: () => {
          markAsLoaded();
          startDeferredAssets();
          if (onComplete) onComplete();
        }
      });
    };

    // Message sequence loop
    const step = () => {
      if (isExiting.current) return;

      if (currentIndex < MESSAGES.length - 1) {
        currentIndex += 1;
        if (currentIndex === 2) {
          setStatusText('LOADING EXPERIENCE');
        }

        animateTextTransition(currentIndex, () => {
          timeoutId = setTimeout(step, stepDuration);
        });
      } else {
        // Reached final message ("Udaipur '26") - wait for critical assets
        criticalPromise.then(() => {
          // Brief hold so user reads "Udaipur '26" before curtain lifts
          timeoutId = setTimeout(triggerExitWipe, isReturning ? 150 : 280);
        });
      }
    };

    // Initial greeting entrance
    if (textRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 14, filter: 'blur(5px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }
      );
    }

    timeoutId = setTimeout(step, isReturning ? 200 : 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onReveal, onComplete]);

  return (
    <div
      ref={containerRef}
      className="loader-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F2',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      {/* Centered Greeting & Metadata */}
      <div
        ref={contentRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '24px'
        }}
      >
        {/* Main Center Greeting */}
        <div style={{ textAlign: 'center', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1
            ref={textRef}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(28px, 3.5vw, 54px)',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              color: '#4A4A4A',
              margin: 0,
              lineHeight: 1.15
            }}
          >
            {MESSAGES[messageIndex]}
          </h1>
        </div>

        {/* Subtle Technical Metadata at the Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#4A4A4A',
            opacity: 0.45,
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>AWS COMMUNITY DAY</span>
            <span>·</span>
            <span>UDAIPUR / 2026</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '9px' }}>
            <span
              ref={statusDotRef}
              className="loader-dot-pulse"
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: '#4A4A4A',
                transition: 'background-color 0.3s ease'
              }}
            />
            <span>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Large Curved Bottom Wipe Apron (Physical Gallery Door Curve) */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          height: '280px',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        >
          <path
            ref={pathRef}
            d="M 0,0 L 1440,0 L 1440,0 Q 720,260 0,0 Z"
            fill="#F5F5F2"
          />
        </svg>
      </div>
    </div>
  );
}
