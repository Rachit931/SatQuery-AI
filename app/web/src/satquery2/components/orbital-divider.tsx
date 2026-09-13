'use client';

import React, { useEffect, useRef, useState } from 'react';
import './orbital-divider.css';

export default function OrbitalDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`orbital-transition-divider ${isRevealed ? 'is-revealed' : ''}`}
      aria-hidden="true"
    >
      <div className="orbital-divider-inner">
        {/* Left Divider Line */}
        <div className="orbital-line-wing wing-left">
          <span className="divider-line-core" />
        </div>

        {/* Center Earth & Orbital Ring (matching user reference image) */}
        <div className="orbital-planet-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="orbital-planet-svg"
          >
            {/* Back arc of tilted electric blue orbital ring */}
            <g transform="rotate(-33 18 18)">
              <path
                d="M 4.5 18 A 13.5 5.8 0 0 1 31.5 18"
                stroke="#38BDF8"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </g>

            {/* Earth Circular Ring Body (Pure White) */}
            <circle
              cx="18"
              cy="18"
              r="7.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
            />

            {/* Center Core Coordinate Dot (White) */}
            <circle
              cx="18"
              cy="18"
              r="1.1"
              fill="#FFFFFF"
            />

            {/* Front arc of tilted electric blue orbital ring (loops over bottom-left of Earth) */}
            <g transform="rotate(-33 18 18)">
              <path
                d="M 31.5 18 A 13.5 5.8 0 0 1 4.5 18"
                stroke="#38BDF8"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Right Divider Line with One-time Traveling Pink Pulse Dot */}
        <div className="orbital-line-wing wing-right">
          <span className="divider-line-core" />
          <span className="orbital-trail-glow" />
          <span className="orbital-data-pulse-dot" />
        </div>
      </div>
    </div>
  );
}
