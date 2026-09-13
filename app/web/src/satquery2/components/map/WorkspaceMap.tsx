'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAIContext } from '../../services/aiContextBridge';

// Dynamically import the map to avoid SSR issues with Leaflet
const WatchZoneMap = dynamic(() => import('./WatchZoneMap'), { ssr: false });

export default function WorkspaceMap() {
  const { setMapContext } = useAIContext();
  const [mapLayer, setMapLayer] = useState<'Satellite' | 'Street' | 'Terrain'>('Satellite');

  const handleBoundsChange = (boundsStr: string) => {
    // boundsStr format: "west,south,east,north"
    const [west, south, east, north] = boundsStr.split(',').map(Number);
    
    // Calculate center
    const lat = (south + north) / 2;
    const lng = (west + east) / 2;
    
    setMapContext({
      center: { lat, lng },
      bounds: boundsStr,
      zoom: 11, // Defaulting to 11 as we don't have direct zoom from this string, but it's fine for context
    });
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-10 flex bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10 p-1 shadow-lg">
        {['Satellite', 'Street', 'Terrain'].map((layer) => (
          <button
            key={layer}
            onClick={() => setMapLayer(layer as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mapLayer === layer 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {layer}
          </button>
        ))}
      </div>
      <WatchZoneMap
        mapLayer={mapLayer}
        onBoundsChange={handleBoundsChange}
        className="w-full h-full"
      />
    </div>
  );
}
