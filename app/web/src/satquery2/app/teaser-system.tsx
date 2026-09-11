'use client';

import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import './teaser-system.css';

const teasers = [
  [
    'workspace',
    '01 / EARTH INTELLIGENCE',
    ['From Observation', 'To Action.'],
    'Turn satellite imagery into actionable Earth intelligence with real-time geospatial pipelines.',
    'Enter Workspace',
    '/watch-zone',
    'workflow',
  ],
  [
    'analysis',
    '02 / SATELLITE ANALYSIS',
    ['Satellite', 'Analysis'],
    'Explore high-resolution multi-spectral imagery and pinpoint anomalies with AI precision.',
    'Explore Analysis',
    '/#analysis',
    'analysis',
  ],
  [
    'watch-zone',
    '03 / CONTINUOUS MONITORING',
    ['Watch', 'Zone'],
    'Keep your critical regions of interest under constant orbital watch with automated trigger alerts.',
    'Open Watch Zone',
    '/watch-zone',
    'watch',
  ],
  [
    'offline',
    '04 / FIELD INTELLIGENCE',
    ['Offline', 'Field Mode'],
    'Bring pre-cached satellite maps and verified telemetry directly into remote field missions.',
    'Prepare Field Data',
    '/#offline',
    'offline',
  ],
  [
    'time-machine',
    '05 / TIME MACHINE',
    ['See', 'Change.'],
    'Travel through historical orbital captures to track deforestation, floods, and urban expansion.',
    'Explore Timeline',
    '/watch-zone',
    'time',
  ],
  [
    'multimodal',
    '06 / MULTIMODAL SENSORS',
    ['One Question.', 'Multiple Sensors.'],
    'Fuse Optical, SAR, Thermal, and elevation datasets to eliminate false positives.',
    'Sensor Capabilities',
    '/#workspace',
    'multi',
  ],
  [
    'agent',
    '07 / AGENTIC INTELLIGENCE',
    ['The Agent', 'Does the Work.'],
    'Autonomous reasoning agents parse natural language prompts and extract quantitative proof.',
    'Meet the Agent',
    '/#workspace',
    'agent',
  ],
  [
    'evidence',
    '08 / VERIFIABLE AUDIT',
    ["Don't Just See.", 'Verify It.'],
    'Every insight comes with cryptographically verifiable pixel origins and sensor provenance.',
    'View Evidence Log',
    '/watch-zone',
    'evidence',
  ],
] as const;

function Visual({ type }: { type: string }) {
  const steps =
    type === 'multi'
      ? ['OPTICAL (10m)', 'SAR RADAR', 'SPECTRAL NDVI', 'AI FUSION', 'VERIFIED']
      : type === 'agent'
      ? ['NATURAL QUERY', 'AOI PARSING', 'DATA RETRIEVAL', 'AI INFERENCE', 'VALIDATE']
      : ['RAW TELEMETRY', 'MODEL PIPELINE', 'CHANGE DETECTION', 'AUDIT TRAIL', '✓ CONFIRMED'];

  if (type === 'workflow') {
    return (
      <div className="teaser-visual workflow">
        <div className="mini-earth" />
        <div className="radar-sweep" />
        <div className="flow">
          <span>OPTICAL</span>
          <i />
          <span>AOI BOUNDS</span>
          <i />
          <span>AI MODEL</span>
          <i />
          <span className="flow-accent">ACTION</span>
        </div>
      </div>
    );
  }

  if (type === 'analysis') {
    return (
      <div className="teaser-visual analysis">
        <div className="sat-image" />
        <div className="detect">
          <div className="detect-header">
            <span>TARGET REGION</span>
            <span className="live-dot" />
          </div>
          <b>CHANGE DETECTED</b>
          <div className="detect-bar"><div style={{ width: '88%' }} /></div>
          <small>88% AI CONFIDENCE • +3.8 HA</small>
        </div>
      </div>
    );
  }

  if (type === 'watch') {
    return (
      <div className="teaser-visual watch">
        <div className="watch-status">
          <span className="pulse-ring" />
          <b>LIVE MONITORING</b>
        </div>
        <div className="aoi">
          <span>TARGET AOI</span>
          <strong>◇</strong>
          <small>DELHI - YAMUNA BASIN</small>
        </div>
        <div className="watch-meta">
          <span>LAST PASS: 2H AGO</span>
          <span>NEXT: SENTINEL-2A</span>
        </div>
      </div>
    );
  }

  if (type === 'offline') {
    return (
      <div className="teaser-visual offline">
        <div className="map" />
        <div className="offline-panel">
          <b>OFFLINE MISSION PACK</b>
          <div className="offline-badge">STANDALONE SYNCED</div>
          <div className="offline-list">
            <div className="check-row"><span>✓ High-res Basemap Cache</span></div>
            <div className="check-row"><span>✓ Vector Boundaries (GeoJSON)</span></div>
            <div className="check-row"><span>✓ On-Device Telemetry Engine</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'time') {
    return (
      <div className="teaser-visual time">
        <div className="years">
          <span>2023</span>
          <i>—</i>
          <span>2024</span>
          <i>—</i>
          <span>2025</span>
          <i>—</i>
          <span className="year-active">2026 (NOW)</span>
        </div>
        <div className="compare">
          <div className="compare-half before-half"><b>BEFORE</b></div>
          <i className="slider-divider" />
          <div className="compare-half after-half"><b>AFTER</b></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`teaser-visual pipeline ${type}`}>
      <div className="pipeline-container">
        {steps.map((step, index) => (
          <div className="pipeline-node" key={step} data-step={index}>
            <span
              className={index === steps.length - 1 ? 'node-final' : `node-step-${index}`}
            >{step}</span>
            {index < steps.length - 1 && <i className="pipeline-arrow" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeaserSystem() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const screens = containerRef.current?.querySelectorAll<HTMLElement>('.teaser-screen');
    if (!screens) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelector('.teaser-card')?.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.35 }
    );

    screens.forEach((screen) => observer.observe(screen));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="teaser-system" id="workspace" aria-label="SatQuery overview">
      {teasers.map(([id, label, title, copy, cta, link, type], index) => (
        <div
          className="teaser-screen"
          key={id}
          id={id}
          style={{ '--screen-idx': index, zIndex: 10 + index } as React.CSSProperties}
        >
          <article className="teaser-card">
            <div className="teaser-story">
              <p className="teaser-label">{label}</p>
              <h2>
                {title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p className="teaser-copy">{copy}</p>
              <Link href={link} className="teaser-cta">
                <span>{cta}</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <Visual type={type} />
          </article>
        </div>
      ))}
    </section>
  );
}
