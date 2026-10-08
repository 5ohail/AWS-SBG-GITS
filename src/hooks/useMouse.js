import { useEffect, useRef } from 'react';

export function useMouse() {
  const mouse = useRef({ x: 0, y: 0, clientX: 0, clientY: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalized coordinates: -1 to 1 (center is 0, 0)
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;

      mouse.current.targetX = nx;
      mouse.current.targetY = ny;
      mouse.current.clientX = e.clientX;
      mouse.current.clientY = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const nx = (touch.clientX / window.innerWidth) * 2 - 1;
        const ny = -(touch.clientY / window.innerHeight) * 2 + 1;
        mouse.current.targetX = nx;
        mouse.current.targetY = ny;
        mouse.current.clientX = touch.clientX;
        mouse.current.clientY = touch.clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationFrameId;
    const smoothLoop = () => {
      // Smooth lerping
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;
      animationFrameId = requestAnimationFrame(smoothLoop);
    };
    animationFrameId = requestAnimationFrame(smoothLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return mouse;
}
