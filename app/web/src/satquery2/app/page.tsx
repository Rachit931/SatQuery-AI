import { ArrowUpRight, Search } from 'lucide-react';
import Link from 'next/link';
import SpaceScene from './space-scene';
import NebulaBackground from './nebula-background';
import TeaserSystem from './teaser-system';
import SatelliteCursor from '../components/satellite-cursor';
import NavSignIn from '../components/nav-signin';
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
      <SatelliteCursor />
      <NebulaBackground />
      <SpaceScene />
      <header className="site-nav">
        <Link className="brand" href="/" aria-label="SatQuery home" data-sat-interactive="nav">
          <Mark />
          <span>SatQuery</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/" data-sat-interactive="nav">Home</Link>
          <Link href="/workspace" data-sat-interactive="nav">Workspace</Link>
          <Link href="/watch-zone" data-sat-interactive="nav">Watch Zone</Link>
          <Link href="/workspace" data-sat-interactive="nav">Offline Mode</Link>
          <Link href="/#history" data-sat-interactive="nav">History</Link>
          <button type="button" className="nav-search-btn" aria-label="Search" data-sat-interactive="nav">
            <Search size={16} />
          </button>
          <span className="nav-divider" aria-hidden="true" />
          <NavSignIn />
        </nav>
      </header>
      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Earth intelligence. Made clear
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
          <Link className="primary-cta" href="/workspace" data-sat-interactive="cta">
            Explore Workspace <ArrowUpRight size={17} />
          </Link>
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
