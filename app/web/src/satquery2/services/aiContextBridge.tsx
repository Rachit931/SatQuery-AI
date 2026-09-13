'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MapContext, WatchZoneContext } from './aiProvider';

interface AIContextState {
  mapContext: MapContext;
  watchZoneContext: WatchZoneContext | null;
  setMapContext: (context: MapContext) => void;
  setWatchZoneContext: (context: WatchZoneContext | null) => void;
}

const AIContext = createContext<AIContextState | undefined>(undefined);

export function AIContextProvider({ children }: { children: ReactNode }) {
  const [mapContext, setMapContext] = useState<MapContext>({
    center: null,
    bounds: null,
    zoom: 1,
  });
  
  const [watchZoneContext, setWatchZoneContext] = useState<WatchZoneContext | null>(null);

  return (
    <AIContext.Provider value={{ mapContext, setMapContext, watchZoneContext, setWatchZoneContext }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
}
