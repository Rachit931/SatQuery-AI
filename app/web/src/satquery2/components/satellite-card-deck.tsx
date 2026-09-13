/* oxlint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */
'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import './satellite-card-deck.css';

const cards = [
  {
    id: 'satellite-analysis',
    name: 'Satellite Analysis',
    subtitle: 'High-Res Multi-Spectral',
    image: '/cards/satellite-analysis.jpg',
    alt: 'Photorealistic Earth-observation satellite orbiting above Earth with solar panels and visible curvature',
    badge: 'OPTICAL',
    tagline: 'Sub-Meter Orbital Optics',
  },
  {
    id: 'flood-monitoring',
    name: 'Flood Monitoring',
    subtitle: 'Disaster Inundation SAR',
    image: '/cards/flood-detection.jpg',
    alt: 'High-altitude aerial photograph of flooded settlement and overflowing river',
    badge: 'SAR RADAR',
    tagline: 'All-Weather Active Radar',
  },
  {
    id: 'change-detection',
    name: 'Change Detection',
    subtitle: 'Bi-Temporal & Environmental AI',
    image: '/cards/change-detection.jpg',
    alt: 'Before and after satellite comparison showing environmental water body change',
    badge: 'BI-TEMPORAL',
    tagline: 'Multi-Epoch Change AI',
  },
  {
    id: 'land-monitoring',
    name: 'Land Monitoring',
    subtitle: 'Vegetation & Crop Index',
    image: '/cards/watch-zones.jpg',
    alt: 'High-altitude satellite view of geometric patchwork agricultural fields and river',
    badge: 'NDVI',
    tagline: 'Canopy Vitality & AOI',
  },
  {
    id: 'terrain-mapping',
    name: 'Terrain Mapping',
    subtitle: 'Digital Elevation Topography',
    image: '/cards/field-intelligence.jpg',
    alt: 'Dramatic high-altitude mountain landscape with subtle topographic elevation contour lines',
    badge: 'DEM 3D',
    tagline: 'Orbital Surface Elevation',
  },
];

export default function SatelliteCardDeck() {
  const deckRef = useRef<HTMLUListElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const section = deck.closest<HTMLElement>('#workspace, .earth-intel-section, .teaser-screen') ?? deck;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const items = Array.from(deck.querySelectorAll<HTMLElement>('.sat-deck-position'));
    
    let rafId = 0;
    let isVisible = true;
    let isAnimating = false;
    let targetProgress = 0;
    let currentProgress = 0;

    const applyTransforms = (prog: number) => {
      // Fluid ease-out curve for natural deceleration
      const easeProgress = 1 - Math.pow(1 - prog, 2.5);

      const deckWidth = deck.clientWidth;
      const spreadMultiplier = deckWidth < 520 ? 0.52 : deckWidth < 780 ? 0.74 : deckWidth < 1050 ? 0.88 : 1.0;

      items.forEach((item, index) => {
        const side = index - 2; // -2 (Infrared), -1 (SAR), 0 (Optical), 1 (NDVI), 2 (DEM)
        const depth = Math.abs(side);

        // 1. Arch Y curve: center is top, outer cards arch downwards
        const archY = depth === 0 ? 0 : depth === 1 ? 22 : 54;
        const riseY = (1 - easeProgress) * 42;
        const y = (archY * easeProgress + riseY) * spreadMultiplier;

        // 2. Horizontal spread outward from center
        const baseX = side === 0 ? 0 : side === -1 ? -138 : side === 1 ? 138 : side === -2 ? -265 : 265;
        const x = baseX * spreadMultiplier * easeProgress;

        // 3. Rotation: center 0°, mid ±7°, outer ±15°
        const baseRot = side * (depth === 2 ? 7.5 : 7);
        const rotation = baseRot * (spreadMultiplier < 0.65 ? 0.75 : 1) * easeProgress;

        // 4. Scale: Center card is biggest (1.0), mid 0.88, outer 0.80
        const targetScale = depth === 0 ? 1.0 : depth === 1 ? 0.88 : 0.80;
        const scale = 0.92 + (targetScale - 0.92) * easeProgress;

        item.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        item.style.setProperty('--sat-base-rotation', `${rotation.toFixed(2)}deg`);
      });
    };

    const animateLoop = () => {
      if (!isVisible || reducedMotion.matches) {
        isAnimating = false;
        return;
      }

      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0008) {
        // Damped lerp: buttery smooth 60/120fps physics
        currentProgress += diff * 0.12;
        applyTransforms(currentProgress);
        rafId = requestAnimationFrame(animateLoop);
      } else {
        currentProgress = targetProgress;
        applyTransforms(currentProgress);
        isAnimating = false;
      }
    };

    const requestUpdate = () => {
      if (reducedMotion.matches) return;
      const windowHeight = window.innerHeight;
      const rect = section.getBoundingClientRect();

      // Progress begins as section enters bottom and hits 1.0 when centered
      const rawProgress = (windowHeight - rect.top) / (windowHeight * 0.85);
      targetProgress = Math.max(0, Math.min(1, rawProgress));

      if (!isAnimating) {
        isAnimating = true;
        rafId = requestAnimationFrame(animateLoop);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        deck.classList.toggle('sat-deck-active', isVisible && !reducedMotion.matches);
        if (isVisible) {
          requestUpdate();
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(section);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    reducedMotion.addEventListener('change', requestUpdate);

    requestUpdate();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      reducedMotion.removeEventListener('change', requestUpdate);
    };
  }, []);

  // 3D Parallax & Specular Light Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    // Specular light spotlight coordinate in percentages
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${px.toFixed(1)}%`);
    card.style.setProperty('--mouse-y', `${py.toFixed(1)}%`);

    // Subtle 3D tilt (max 1.2 degrees for restrained physical depth)
    const tiltX = normY * -2.4;
    const tiltY = normX * 2.4;
    card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);

    // Subtle image parallax opposite cursor direction (3-4px max)
    const imgPx = normX * -7;
    const imgPy = normY * -7;
    card.style.setProperty('--img-px', `${imgPx.toFixed(1)}px`);
    card.style.setProperty('--img-py', `${imgPy.toFixed(1)}px`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--img-px', '0px');
    card.style.setProperty('--img-py', '0px');
    card.style.removeProperty('--mouse-x');
    card.style.removeProperty('--mouse-y');
    setHoveredIndex(null);
  };

  const getHoverState = (index: number) => {
    if (hoveredIndex === null) return { isHovered: false, neighborOffset: 0 };
    if (hoveredIndex === index) return { isHovered: true, neighborOffset: 0 };
    const dist = Math.abs(index - hoveredIndex);
    const dir = index < hoveredIndex ? -1 : 1;
    const shift = dist === 1 ? 16 : 8;
    return { isHovered: false, neighborOffset: dir * shift };
  };

  return (
    <ul ref={deckRef} className="sat-deck" aria-label="Satellite Capabilities">
      {cards.map((card, index) => {
        const side = index - 2;
        const depth = Math.abs(side);
        const baseZ = depth === 0 ? 10 : depth === 1 ? 7 : 4;
        const { isHovered, neighborOffset } = getHoverState(index);

        return (
          <li
            key={card.id}
            className={`sat-deck-position sat-deck-pos-${index}`}
            style={
              {
                '--sat-order': baseZ,
                '--sat-side': side,
                '--neighbor-shift': `${neighborOffset}px`,
                zIndex: isHovered ? 45 : baseZ,
              } as CSSProperties
            }
          >
            <div className={`sat-deck-float sat-deck-float-${index}`}>
              {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
              <figure
                className={`sat-deck-card ${isHovered ? 'is-hovered' : ''} ${depth === 0 ? 'is-center' : ''}`}
                tabIndex={0}
                data-sat-interactive="card"
                aria-label={`${card.name} - ${card.subtitle}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
              >
                <div className="sat-card-img-wrap">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 768px) 180px, (max-width: 1200px) 240px, 290px"
                    priority={index === 2}
                    className="sat-card-img"
                  />
                  {/* Dynamic Specular Light spotlight tracking cursor */}
                  <div className="sat-card-specular" aria-hidden="true" />
                  
                  {/* Single-pass Satellite Sensor Scan Line */}
                  <div className="sat-card-scanline" aria-hidden="true" />

                  {/* Corner Targeting Acquisition Marks */}
                  <div className="sat-card-corners" aria-hidden="true">
                    <span className="sat-corner sat-corner-tl" />
                    <span className="sat-corner sat-corner-tr" />
                    <span className="sat-corner sat-corner-bl" />
                    <span className="sat-corner sat-corner-br" />
                  </div>

                  {/* Single Acid Lime Data Point on Technical Vector */}
                  <div className="sat-card-data-track" aria-hidden="true">
                    <span className="sat-card-datapoint" />
                  </div>

                  {/* Satellite Lock-on Border Highlight */}
                  <div className="sat-card-lockon-border" aria-hidden="true" />
                  <div className="sat-card-border-glow" aria-hidden="true" />
                </div>
                
                <figcaption className="sat-card-overlay">
                  <div className="sat-card-badge-row">
                    <span className="sat-card-dot" aria-hidden="true" />
                    <span className="sat-card-badge">{card.badge}</span>
                  </div>
                  <div className="sat-card-title">{card.name}</div>
                  <div className="sat-card-sub">{card.subtitle}</div>
                </figcaption>
              </figure>
            </div>
          </li>
        );
      })}
    </ul>
  );
}



