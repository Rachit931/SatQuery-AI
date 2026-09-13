'use client';

import { useEffect, useRef } from 'react';
import './satellite-cursor.css';

export default function SatelliteCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch / coarse pointer devices
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isHovering = false;
    let isVisible = false;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        currentX = targetX;
        currentY = targetY;
      }

      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest?.(
        '[data-sat-interactive], a, button, [role="button"], .sat-card, .about-feature-item, .about-metric-card, .primary-cta, .about-cta-btn'
      );

      if (interactiveEl) {
        if (!isHovering) {
          isHovering = true;
          cursor.classList.add('is-active');
        }
      } else {
        if (isHovering) {
          isHovering = false;
          cursor.classList.remove('is-active');
        }
      }
    };

    const onMouseLeave = () => {
      isHovering = false;
      cursor.classList.remove('is-active');
    };

    const loop = () => {
      // Smooth lerp (0.22 factor provides crisp responsive aerospace tracking lag)
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      cursor.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="satellite-tracking-cursor"
      aria-hidden="true"
    >
      <span className="satellite-cursor-dot" />
    </div>
  );
}
