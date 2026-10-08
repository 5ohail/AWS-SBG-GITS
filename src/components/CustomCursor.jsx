import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor({ mouse }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [cursorState, setCursorState] = useState('default'); // 'default', 'hover', 'glass'
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on fine pointer devices (desktop mouse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let ringX = 0;
    let ringY = 0;
    let dotX = 0;
    let dotY = 0;

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    let rafId;
    const updateCursor = () => {
      if (mouse.current.clientX !== undefined) {
        // Fast direct dot
        dotX += (mouse.current.clientX - dotX) * 0.4;
        dotY += (mouse.current.clientY - dotY) * 0.4;

        // Smooth trailing ring
        ringX += (mouse.current.clientX - ringX) * 0.15;
        ringY += (mouse.current.clientY - ringY) * 0.15;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
        }
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        }
      }
      rafId = requestAnimationFrame(updateCursor);
    };
    rafId = requestAnimationFrame(updateCursor);

    // Event delegation for interactive hover targets
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], .interactive, .glass-target');
      if (target) {
        if (target.classList.contains('glass-target')) {
          setCursorState('glass');
        } else {
          setCursorState('hover');
        }
      } else {
        setCursorState('default');
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, [mouse]);

  if (!isVisible) return null;

  return (
    <div className="custom-cursor-container pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Small precision center dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full transition-all duration-200 ${
          cursorState === 'hover'
            ? 'bg-[#FF9900] scale-150'
            : cursorState === 'glass'
            ? 'bg-white opacity-90'
            : 'bg-white'
        }`}
      />
      
      {/* Outer ambient trailing ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-all duration-300 ease-out pointer-events-none ${
          cursorState === 'hover'
            ? 'w-10 h-10 -ml-5 -mt-5 border-[#FF9900]/60 bg-[#FF9900]/10 scale-110'
            : cursorState === 'glass'
            ? 'w-16 h-16 -ml-8 -mt-8 border-white/40 bg-white/5 backdrop-blur-[1px] scale-125'
            : 'w-6 h-6 -ml-3 -mt-3 border-white/25 bg-transparent'
        }`}
      />
    </div>
  );
}

