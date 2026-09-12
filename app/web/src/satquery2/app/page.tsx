import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import SpaceScene from './space-scene';
import NebulaBackground from './nebula-background';
import TeaserSystem from './teaser-system';
import Navbar from '@/components/Navbar';

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
    </span>
  );
}

export default function Home() {
  return (
    <main>
      <NebulaBackground />
      <SpaceScene />
      <Navbar />
      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Earth intelligence, made clear
          </p>
          <h1>
            See Earth.
            <br />
            <em>Understand Change.</em>
          </h1>
          <p className="lede">
            Explore satellite imagery, monitor your regions, and take insights
            into the field.
          </p>
          <a className="primary-cta" href="#workspace">
            Explore Workspace <ArrowUpRight size={17} />
          </a>
        </div>
        <p className="scroll-cue">
          <span>Scroll to explore</span>
          <i />
        </p>
      </section>

      <TeaserSystem />

      <footer id="footer">
        <div className="footer-content">
          <a className="brand" href="#home">
            <Mark />
            <span>SatQuery</span>
          </a>
          <p>Satellite intelligence for decisions that happen on the ground.</p>
          <div className="social-links" aria-label="Social links">
            <a href="#footer" aria-label="SatQuery on LinkedIn">
              <span aria-hidden="true">in</span>
            </a>
            <a href="#footer" aria-label="SatQuery on Instagram">
              <span aria-hidden="true">◎</span>
            </a>
            <a href="#footer" aria-label="SatQuery on YouTube">
              <span aria-hidden="true">▶</span>
            </a>
          </div>
        </div>
        <div className="footer-links">
          <div>
            <strong>Product</strong>
            <Link href="/#workspace">Workspace</Link>
            <Link href="/watch-zone">Watch Zone</Link>
            <Link href="/history">History</Link>
            <Link href="/#offline">Offline Mode</Link>
          </div>
          <div>
            <strong>Explore</strong>
            <a href="#analysis">Analysis</a>
            <a href="#home">About</a>
            <a href="mailto:hello@satquery.com">Contact</a>
          </div>
          <div>
            <strong>Company</strong>
            <a href="#home">Mission</a>
            <a href="#footer">Journal</a>
            <a href="mailto:hello@satquery.com">Careers</a>
          </div>
        </div>
        <div className="satellite-landing" aria-hidden="true">
          <span>Satellite dock</span>
        </div>
        <p className="copyright">
          © 2026 SatQuery. Earth intelligence, made clear.
        </p>
      </footer>
    </main>
  );
}
