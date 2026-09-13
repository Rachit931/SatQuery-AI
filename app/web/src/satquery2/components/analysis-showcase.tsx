'use client';

import './analysis-showcase.css';

export function AnalysisSpace() {
  return <div className="analysis-space" aria-hidden="true"><div className="analysis-stars" /><div className="analysis-horizon"><div /></div></div>;
}

export function AnalysisLaptop() {
  return (
    <div className="analysis-laptop" role="img" aria-label="Laptop displaying the SatQuery satellite analysis interface: target region, change detected, 88% AI confidence, plus 3.8 hectares.">
      <div className="analysis-laptop-lid" aria-hidden="true">
        <div className="analysis-laptop-camera" />
        <div className="analysis-laptop-screen">
          <div className="analysis-app-bar"><strong>SatQuery</strong><span>Satellite Analysis</span><i /></div>
          <div className="analysis-app-body">
            <div className="analysis-app-sidebar"><small>LAYERS</small><span>Optical</span><span>AOI bounds</span><span>Change detection</span><div className="analysis-app-chart" /></div>
            <div className="analysis-app-map"><div className="analysis-app-aoi" /><div className="analysis-app-result"><small>TARGET REGION</small><strong>CHANGE DETECTED</strong><span>88% AI CONFIDENCE · +3.8 HA</span></div></div>
          </div>
        </div>
      </div>
      <div className="analysis-laptop-base" aria-hidden="true"><i /></div>
    </div>
  );
}
