import { ArrowUpRight, Search } from 'lucide-react';
import Link from 'next/link';
import SpaceScene from './space-scene';
import NebulaBackground from './nebula-background';
import TeaserSystem from './teaser-system';
import OrbitalDivider from '../components/orbital-divider';
import AboutSatQuery from '../components/about-satquery';
import NavSignIn from '../components/nav-signin';
import SiteFooter from '../components/site-footer';
import SatelliteCursor from '../components/satellite-cursor';

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

      <OrbitalDivider />

      <AboutSatQuery />

      <SiteFooter />
    </main>
  );
}
