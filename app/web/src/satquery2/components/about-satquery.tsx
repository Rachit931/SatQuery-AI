'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Globe,
  FileSearch,
  ShieldCheck,
  Bookmark,
  Clock,
  MapPin,
  WifiOff,
} from 'lucide-react';
import './about-satquery.css';

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export default function AboutSatQuery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth > 900);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);

    let rafId = 0;
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start calculating as section enters the viewport
      // rect.top starts at windowHeight and decreases as user scrolls down
      const totalScrollDistance = rect.height + windowHeight * 0.3;
      const scrolled = windowHeight - rect.top;
      const progress = clamp(scrolled / totalScrollDistance, 0, 1);
      setScrollProgress(progress);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  const isReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Animation values computed directly from scrollProgress
  // Scroll down = progress forward, stop = pause, scroll up = reverse, NO autoplay
  let pEyebrow = 1;
  let pHeadline = 1;
  let pDesc = 1;
  let pCta = 1;
  let pStats = 1;

  let pWhatHeader = 1;
  let pRow1 = 1;
  let pRow2 = 1;
  let pRow3 = 1;

  let pHowHeader = 1;
  let pStep1 = 1;
  let pStep2 = 1;
  let pStep3 = 1;
  let pStep4 = 1;
  let lineProgressPercent = 100;

  if (isDesktop && !isReduced) {
    const p = scrollProgress;

    // Part 1 Left Animations (starts immediately as section enters: 0.06 to 0.36)
    pEyebrow = clamp((p - 0.05) / 0.08, 0, 1);
    pHeadline = clamp((p - 0.08) / 0.08, 0, 1);
    pDesc = clamp((p - 0.12) / 0.09, 0, 1);
    pCta = clamp((p - 0.16) / 0.08, 0, 1);
    pStats = clamp((p - 0.20) / 0.10, 0, 1);

    // Part 1 Right Animations (What You Can Do: 0.10 to 0.40)
    pWhatHeader = clamp((p - 0.10) / 0.08, 0, 1);
    pRow1 = clamp((p - 0.15) / 0.09, 0, 1);
    pRow2 = clamp((p - 0.22) / 0.09, 0, 1);
    pRow3 = clamp((p - 0.29) / 0.09, 0, 1);

    // Part 2 Animations (How to Use: 0.35 to 0.85)
    pHowHeader = clamp((p - 0.35) / 0.09, 0, 1);
    pStep1 = clamp((p - 0.40) / 0.09, 0, 1);
    pStep2 = clamp((p - 0.48) / 0.09, 0, 1);
    pStep3 = clamp((p - 0.57) / 0.09, 0, 1);
    pStep4 = clamp((p - 0.66) / 0.09, 0, 1);

    // Technical connecting line fill progress (0% at Step 1, 100% by Step 4)
    const rawLine = clamp((p - 0.42) / 0.32, 0, 1);
    lineProgressPercent = Math.round(rawLine * 100);
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section"
      aria-label="About SatQuery & How to Use"
    >
      <div className="about-container">
        {/* ================================================== */}
        {/* PART 1: ABOUT SATQUERY + WHAT YOU CAN DO           */}
        {/* ================================================== */}
        <div className="about-part-one">
          <div className="about-grid">
            {/* PART 1 — LEFT SIDE */}
            <div className="about-col-left">
              {/* Eyebrow */}
              <div
                className="about-eyebrow-wrap"
                style={{
                  opacity: pEyebrow,
                  transform: `translate3d(0, ${(1 - pEyebrow) * 16}px, 0)`,
                }}
              >
                <span className="about-eyebrow-label">ABOUT SATQUERY</span>
                <span className="about-eyebrow-line" aria-hidden="true" />
              </div>

              {/* Main Heading */}
              <h2
                className="about-main-title"
                style={{
                  opacity: pHeadline,
                  transform: `translate3d(0, ${(1 - pHeadline) * 18}px, 0)`,
                }}
              >
                <span className="title-bone">About</span>
                <br />
                <span className="title-lime">SatQuery.</span>
              </h2>

              {/* Description */}
              <p
                className="about-main-desc"
                style={{
                  opacity: pDesc,
                  transform: `translate3d(0, ${(1 - pDesc) * 16}px, 0)`,
                }}
              >
                SatQuery is an AI-powered satellite intelligence platform that transforms
                complex geospatial data into meaningful insights. We make satellite data simple,
                visual and accessible to everyone — empowering better decisions for a safer,
                smarter and more sustainable world.
              </p>

              {/* Learn More Button */}
              <div
                className="about-cta-wrap"
                style={{
                  opacity: pCta,
                  transform: `translate3d(0, ${(1 - pCta) * 14}px, 0)`,
                }}
              >
                <Link
                  href="/#workspace"
                  className="about-learn-more-btn"
                  data-sat-interactive="cta"
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} className="about-cta-arrow" />
                </Link>
              </div>

              {/* Statistics Row (3 horizontal, no cards, thin graphite vertical separators) */}
              <div
                className="about-stats-row"
                style={{
                  opacity: pStats,
                  transform: `translate3d(0, ${(1 - pStats) * 14}px, 0)`,
                }}
              >
                <div className="about-stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">SATELLITE SOURCES</span>
                  <span className="stat-sub">Trusted global imagery</span>
                </div>

                <div className="stat-separator" aria-hidden="true" />

                <div className="about-stat-item">
                  <span className="stat-number">200+</span>
                  <span className="stat-label">REGIONS COVERED</span>
                  <span className="stat-sub">From cities to remote areas</span>
                </div>

                <div className="stat-separator" aria-hidden="true" />

                <div className="about-stat-item">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">REAL-TIME DATA</span>
                  <span className="stat-sub">Always on. Always informed.</span>
                </div>
              </div>

              {/* Sub-tagline */}
              <div
                className="about-subtagline"
                style={{
                  opacity: pStats,
                  transform: `translate3d(0, ${(1 - pStats) * 10}px, 0)`,
                }}
              >
                <span className="subtagline-bar" aria-hidden="true" />
                <span className="subtagline-text">
                  SATELLITE INTELLIGENCE FOR A BRIGHTER TOMORROW
                </span>
              </div>
            </div>

            {/* PART 1 — RIGHT SIDE: WHAT YOU CAN DO */}
            <div className="about-col-right">
              {/* Header */}
              <div
                className="what-header-wrap"
                style={{
                  opacity: pWhatHeader,
                  transform: `translate3d(0, ${(1 - pWhatHeader) * 16}px, 0)`,
                }}
              >
                <h3 className="what-main-title">
                  <span className="title-bone">What You</span>{' '}
                  <span className="title-lime">Can Do</span>
                  <span className="what-title-line" aria-hidden="true" />
                </h3>
                <p className="what-subtitle">
                  Powerful capabilities to explore, understand and act on our planet.
                </p>
              </div>

              {/* Three Horizontal Feature Rows */}
              <div className="what-features-list">
                {/* 01 — EXPLORE THE PLANET */}
                <div
                  className="what-feature-row"
                  style={{
                    opacity: pRow1,
                    transform: `translate3d(0, ${(1 - pRow1) * 16}px, 0)`,
                  }}
                  data-sat-interactive="feature"
                >
                  <div className="what-feature-icon-badge badge-lime" aria-hidden="true">
                    <Globe size={22} className="feature-icon" />
                  </div>

                  <div className="what-feature-content">
                    <h4 className="what-feature-heading">Explore the Planet</h4>
                    <p className="what-feature-text">
                      View and analyze satellite imagery from anywhere in the world.
                    </p>
                  </div>

                  <div className="what-feature-number">
                    <span className="feature-dash">—</span>
                    <span className="feature-num">01</span>
                  </div>

                  {/* Thin Graphite Divider with Hover Single Traveling Data Point */}
                  <div className="what-row-divider" aria-hidden="true">
                    <span className="what-divider-pulse-hover" />
                  </div>
                </div>

                {/* 02 — ASK. ANALYZE. UNDERSTAND */}
                <div
                  className="what-feature-row"
                  style={{
                    opacity: pRow2,
                    transform: `translate3d(0, ${(1 - pRow2) * 16}px, 0)`,
                  }}
                  data-sat-interactive="feature"
                >
                  <div className="what-feature-icon-badge badge-teal" aria-hidden="true">
                    <FileSearch size={22} className="feature-icon" />
                  </div>

                  <div className="what-feature-content">
                    <h4 className="what-feature-heading">Ask. Analyze. Understand</h4>
                    <p className="what-feature-text">
                      Get clear answers about places, changes and patterns using simple
                      natural language.
                    </p>
                  </div>

                  <div className="what-feature-number">
                    <span className="feature-dash">—</span>
                    <span className="feature-num">02</span>
                  </div>

                  {/* Thin Graphite Divider with Hover Single Traveling Data Point */}
                  <div className="what-row-divider" aria-hidden="true">
                    <span className="what-divider-pulse-hover" />
                  </div>
                </div>

                {/* 03 — SAVE, ACCESS & ACT */}
                <div
                  className="what-feature-row"
                  style={{
                    opacity: pRow3,
                    transform: `translate3d(0, ${(1 - pRow3) * 16}px, 0)`,
                  }}
                  data-sat-interactive="feature"
                >
                  <div className="what-feature-icon-badge badge-lime" aria-hidden="true">
                    <ShieldCheck size={22} className="feature-icon" />
                  </div>

                  <div className="what-feature-content">
                    <h4 className="what-feature-heading">Save, Access &amp; Act</h4>
                    <p className="what-feature-text">
                      Keep your queries, compare results and access your data anytime, even
                      offline.
                    </p>
                  </div>

                  <div className="what-feature-number">
                    <span className="feature-dash">—</span>
                    <span className="feature-num">03</span>
                  </div>

                  {/* Thin Graphite Divider with Hover Single Traveling Data Point */}
                  <div className="what-row-divider" aria-hidden="true">
                    <span className="what-divider-pulse-hover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* CONNECTING THIN DIVIDER (50-70px SPACING)          */}
        {/* ================================================== */}
        <div className="about-parts-divider" aria-hidden="true" />

        {/* ================================================== */}
        {/* PART 2: HOW TO USE SATQUERY                        */}
        {/* ================================================== */}
        <div className="how-to-use-part">
          {/* Header Row */}
          <div
            className="how-header-row"
            style={{
              opacity: pHowHeader,
              transform: `translate3d(0, ${(1 - pHowHeader) * 16}px, 0)`,
            }}
          >
            <div className="how-title-col">
              <h3 className="how-main-title">
                <span className="title-bone">How to Use</span>{' '}
                <span className="title-lime">SatQuery</span>
                <span className="how-title-line" aria-hidden="true" />
              </h3>
              <p className="how-subtitle">
                From satellite data to actionable insight in four simple steps.
              </p>
            </div>

            <div className="how-badge-col">
              <span className="how-badge-text">SIMPLE STEPS. POWERFUL INSIGHTS.</span>
            </div>
          </div>

          {/* 4-Step Horizontal Timeline Track */}
          <div className="how-timeline-container">
            {/* Background continuous graphite line */}
            <div className="how-timeline-track" aria-hidden="true">
              {/* Active Teal Line Progress */}
              <div
                className="how-timeline-active-line"
                style={{ width: `${lineProgressPercent}%` }}
              />
              {/* Tiny Acid Lime Data Points along the line */}
              <span
                className={`timeline-dot dot-1 ${lineProgressPercent >= 33 ? 'is-active' : ''}`}
              />
              <span
                className={`timeline-dot dot-2 ${lineProgressPercent >= 66 ? 'is-active' : ''}`}
              />
              <span
                className={`timeline-dot dot-3 ${lineProgressPercent >= 98 ? 'is-active' : ''}`}
              />
            </div>

            {/* 4 Step Columns */}
            <div className="how-steps-grid">
              {/* STEP 01 */}
              <div
                className={`how-step-card ${lineProgressPercent >= 5 ? 'step-active' : ''}`}
                style={{
                  opacity: pStep1,
                  transform: `translate3d(0, ${(1 - pStep1) * 16}px, 0)`,
                }}
              >
                <div className="how-step-top">
                  <div className="step-circle-badge">01</div>
                </div>

                {/* Small Real Satellite Image Thumbnail */}
                <div className="step-preview-container step-preview-image">
                  <Image
                    src="/sat-step1-area.jpg"
                    alt="Satellite imagery selection area"
                    width={320}
                    height={160}
                    className="step-thumb-img"
                    loading="lazy"
                  />
                  <div className="step-img-overlay" aria-hidden="true">
                    <span className="overlay-reticle" />
                  </div>
                </div>

                <div className="step-text-wrap">
                  <h4 className="step-title">Select an Area</h4>
                  <p className="step-desc">
                    Choose a location or Area of Interest and load the available satellite
                    imagery.
                  </p>
                </div>
              </div>

              {/* STEP 02 */}
              <div
                className={`how-step-card ${lineProgressPercent >= 33 ? 'step-active' : ''}`}
                style={{
                  opacity: pStep2,
                  transform: `translate3d(0, ${(1 - pStep2) * 16}px, 0)`,
                }}
              >
                <div className="how-step-top">
                  <div className="step-circle-badge">02</div>
                </div>

                {/* Small Query Field Preview */}
                <div className="step-preview-container step-preview-query">
                  <div className="step-query-box">
                    <span className="query-placeholder">What changed in this area?</span>
                    <button
                      type="button"
                      className="query-submit-btn"
                      aria-label="Submit query sample"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="step-text-wrap">
                  <h4 className="step-title">Ask Your Question</h4>
                  <p className="step-desc">
                    Ask what you want to understand using simple natural language.
                  </p>
                </div>
              </div>

              {/* STEP 03 */}
              <div
                className={`how-step-card ${lineProgressPercent >= 66 ? 'step-active' : ''}`}
                style={{
                  opacity: pStep3,
                  transform: `translate3d(0, ${(1 - pStep3) * 16}px, 0)`,
                }}
              >
                <div className="how-step-top">
                  <div className="step-circle-badge">03</div>
                </div>

                {/* Small Realistic Before/After Satellite Comparison */}
                <div className="step-preview-container step-preview-compare">
                  <Image
                    src="/sat-step3-compare.jpg"
                    alt="Satellite change detection before and after comparison"
                    width={320}
                    height={160}
                    className="step-thumb-img"
                    loading="lazy"
                  />
                  <div className="step-compare-slider" aria-hidden="true">
                    <div className="compare-slider-line" />
                    <div className="compare-handle-icon">
                      <span>‹›</span>
                    </div>
                  </div>
                </div>

                <div className="step-text-wrap">
                  <h4 className="step-title">Get Intelligence</h4>
                  <p className="step-desc">
                    SatQuery analyzes satellite data and returns clear geospatial insights.
                  </p>
                </div>
              </div>

              {/* STEP 04 */}
              <div
                className={`how-step-card ${lineProgressPercent >= 98 ? 'step-active' : ''}`}
                style={{
                  opacity: pStep4,
                  transform: `translate3d(0, ${(1 - pStep4) * 16}px, 0)`,
                }}
              >
                <div className="how-step-top">
                  <div className="step-circle-badge">04</div>
                </div>

                {/* Compact List Box */}
                <div className="step-preview-container step-preview-list">
                  <div className="step-compact-list">
                    <div className="list-item">
                      <Bookmark size={13} className="list-icon" />
                      <span>Workspace</span>
                    </div>
                    <div className="list-item">
                      <Clock size={13} className="list-icon" />
                      <span>History</span>
                    </div>
                    <div className="list-item">
                      <MapPin size={13} className="list-icon" />
                      <span>Saved Locations</span>
                    </div>
                    <div className="list-item">
                      <WifiOff size={13} className="list-icon" />
                      <span>Offline Mode</span>
                    </div>
                  </div>
                </div>

                <div className="step-text-wrap">
                  <h4 className="step-title">Explore Further</h4>
                  <p className="step-desc">
                    Save results, compare locations, review history, or continue working
                    offline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Bottom Accent */}
          <div className="how-bottom-accent" aria-hidden="true">
            <span className="accent-line" />
            <span className="accent-text">
              A CLEARER TOMORROW, POWERED BY SATELLITE INTELLIGENCE
            </span>
            <span className="accent-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
