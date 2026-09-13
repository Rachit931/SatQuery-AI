'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './site-footer.css';

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
    </span>
  );
}

export default function SiteFooter() {
  const satelliteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sat = satelliteRef.current;
    if (!sat) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = ((e.clientX / innerWidth) - 0.5) * 16;
      targetY = ((e.clientY / innerHeight) - 0.5) * 14;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      if (sat) {
        sat.style.setProperty('--mouse-shift-x', `${currentX.toFixed(2)}px`);
        sat.style.setProperty('--mouse-shift-y', `${currentY.toFixed(2)}px`);
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <footer id="footer" className="site-footer" aria-label="Site Footer">
      {/* 1. Cinematic Lunar & Orbit Background Layers */}
      <div className="footer-lunar-backdrop" aria-hidden="true" />
      <div className="footer-vignette-overlay" aria-hidden="true" />
      <div className="footer-stars-layer" aria-hidden="true" />

      {/* 2. Floating Realistic Satellite matching the reference design */}
      <div
        ref={satelliteRef}
        className="footer-satellite-stage"
        aria-hidden="true"
      >
        <div className="footer-satellite-float-anim">
          <Image
            src="/satellite-model.png"
            alt="SatQuery deep space orbital satellite with solar panels and parabolic dish antenna"
            width={720}
            height={720}
            priority
            className="footer-satellite-img"
          />
        </div>
      </div>

      {/* 3. Content Layer: Brand + 3 Clean SaaS Columns */}
      <div className="footer-inner">
        <div className="footer-main-row">
          {/* Left Column: Brand, Tagline, Social Icons */}
          <div className="footer-brand-col">
            <Link className="footer-brand-link brand" href="/" aria-label="SatQuery home">
              <BrandMark />
              <span>SatQuery</span>
            </Link>

            <p className="footer-brand-desc">
              Pioneering the future of satellite intelligence for a more connected world.
            </p>

            <div className="footer-social-row" aria-label="Social connections">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-btn"
                aria-label="SatQuery on X (Twitter)"
              >
                <span>𝕏</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-btn"
                aria-label="SatQuery on LinkedIn"
              >
                <span>in</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-btn"
                aria-label="SatQuery on YouTube"
              >
                <span>▶</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-btn"
                aria-label="SatQuery on Instagram"
              >
                <span>◎</span>
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="footer-nav-groups">
            {/* Column 1: Company */}
            <nav className="footer-nav-col" aria-label="Company">
              <h4 className="footer-col-heading">Company</h4>
              <ul className="footer-nav-list">
                <li>
                  <a href="#home" className="footer-nav-link">About Us</a>
                </li>
                <li>
                  <a href="mailto:careers@satquery.com" className="footer-nav-link">Careers</a>
                </li>
                <li>
                  <Link href="/#workspace" className="footer-nav-link">News</Link>
                </li>
                <li>
                  <a href="mailto:hello@satquery.com" className="footer-nav-link">Contact</a>
                </li>
              </ul>
            </nav>

            {/* Column 2: Solutions */}
            <nav className="footer-nav-col" aria-label="Solutions">
              <h4 className="footer-col-heading">Solutions</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link href="/#workspace" className="footer-nav-link">Workspace</Link>
                </li>
                <li>
                  <Link href="/watch-zone" className="footer-nav-link">Watch Zone</Link>
                </li>
                <li>
                  <Link href="/#workspace" className="footer-nav-link">Offline Mode</Link>
                </li>
                <li>
                  <Link href="/#workspace" className="footer-nav-link">Earth Observation</Link>
                </li>
              </ul>
            </nav>

            {/* Column 3: Resources */}
            <nav className="footer-nav-col" aria-label="Resources">
              <h4 className="footer-col-heading">Resources</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link href="/#workspace" className="footer-nav-link">API Reference</Link>
                </li>
                <li>
                  <Link href="/#history" className="footer-nav-link">History</Link>
                </li>
                <li>
                  <Link href="/#workspace" className="footer-nav-link">Documentation</Link>
                </li>
                <li>
                  <a href="mailto:hello@satquery.com" className="footer-nav-link">Support</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Area: Subtle Divider & Right-Aligned Copyright (matching reference) */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © 2026 SatQuery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
