'use client';

import { useEffect, useRef } from 'react';
import './teaser-system.css';
import SatelliteCardDeck from '../components/satellite-card-deck';

export default function TeaserSystem() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add('is-revealed');
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="workspace" className="earth-intel-section" aria-label="Earth Intelligence">
      {/* Subtle celestial space background accents */}
      <div className="earth-intel-glow" aria-hidden="true" />
      <div className="earth-intel-stars" aria-hidden="true" />

      <div className="earth-intel-container">
        {/* Centered Top Heading */}
        <header className="earth-intel-header">
          <p className="earth-intel-eyebrow">
            <span className="earth-intel-dot" aria-hidden="true" />
            01 / EARTH INTELLIGENCE
          </p>
          <h2 className="earth-intel-title">
            <span className="title-white">From Observation</span>
            <span className="title-accent" data-sat-interactive="text">To Action.</span>
          </h2>
        </header>

        {/* Floating Satellite Cards Fan */}
        <div className="earth-intel-deck-stage">
          <SatelliteCardDeck />
        </div>
      </div>
    </section>
  );
}




