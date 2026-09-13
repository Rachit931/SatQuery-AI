'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// Fix Leaflet's default icon path issues with webpack/next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fix Leaflet-Draw 1.0.4 bug: undeclared 'type' variable in readableArea throws ReferenceError in strict mode
type GeometryUtilWithReadableArea = {
  readableArea?: (area: number, isMetric?: unknown, precision?: unknown) => string;
};
type DrawClassWithProto = {
  prototype: {
    options: {
      showArea?: boolean;
    };
  };
};

const extendedL = L as unknown as {
  GeometryUtil?: GeometryUtilWithReadableArea;
  Draw?: {
    Polygon?: DrawClassWithProto;
    Rectangle?: DrawClassWithProto;
  };
};

if (typeof window !== 'undefined' && extendedL.GeometryUtil) {
  extendedL.GeometryUtil.readableArea = function () {
    return '';
  };
}
if (typeof window !== 'undefined' && extendedL.Draw) {
  if (extendedL.Draw.Polygon) {
    extendedL.Draw.Polygon.prototype.options.showArea = false;
  }
  if (extendedL.Draw.Rectangle) {
    extendedL.Draw.Rectangle.prototype.options.showArea = false;
  }
}

interface WatchZoneMapProps {
  onZoneCreated?: (layer: any) => void;
  selectedZoneGeometry?: any;
  className?: string;
  mapLayer: 'Satellite' | 'Street' | 'Terrain';
  isDrawing?: boolean;
  onBoundsChange?: (bounds: string) => void;
}

const mapLayers = {
  Satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  Street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  Terrain:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
};

const mapAttributions = {
  Satellite: 'Tiles &copy; Esri',
  Street: '&copy; OpenStreetMap contributors',
  Terrain: 'Tiles &copy; Esri',
};

export default function WatchZoneMap({
  onZoneCreated,
  selectedZoneGeometry,
  className,
  mapLayer,
  isDrawing,
  onBoundsChange,
}: WatchZoneMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.FeatureGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const polygonDrawerRef = useRef<any>(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      mapRef.current &&
      !leafletMapRef.current
    ) {
      const map = L.map(mapRef.current, {
        center: [28.6139, 77.209], // Default to Delhi as per screenshot
        zoom: 11,
        zoomControl: false, // We'll use custom or top-right
      });

      L.control
        .zoom({
          position: 'topright',
        })
        .addTo(map);

      const tileLayer = L.tileLayer(mapLayers[mapLayer], {
        attribution: mapAttributions[mapLayer],
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      layerGroupRef.current = drawnItems;

      // @ts-ignore
      const drawControl = new (L.Control as any).Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polygon: {
            showArea: false,
            shapeOptions: {
              color: '#00f7ff',
              fillColor: '#00aeff',
              fillOpacity: 0.2,
              weight: 2,
            },
          },
          rectangle: {
            showArea: false,
            shapeOptions: {
              color: '#00f7ff',
              fillColor: '#00aeff',
              fillOpacity: 0.2,
              weight: 2,
            },
          },
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
        },
        position: 'topleft',
      });
      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      map.on(L.Draw.Event.CREATED, function (event: any) {
        var layer = event.layer;
        drawnItems.addLayer(layer);
        if (onZoneCreated) {
          onZoneCreated(layer.toGeoJSON());
        }
      });
      
      // Initialize polygon drawer for programmatic access
      polygonDrawerRef.current = new (L.Draw.Polygon as any)(map, (drawControl.options as any).draw.polygon);

      leafletMapRef.current = map;

      const updateBounds = () => {
        if (onBoundsChange) {
          const b = map.getBounds();
          const boundsStr = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
          onBoundsChange(boundsStr);
        }
      };

      map.on('moveend', updateBounds);
      // Trigger initial bounds
      setTimeout(updateBounds, 500);
    }

    return () => {
      // Cleanup happens only on unmount
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []); // Empty dependency array, init once

  useEffect(() => {
    if (isDrawing && polygonDrawerRef.current) {
      polygonDrawerRef.current.enable();
    } else if (!isDrawing && polygonDrawerRef.current) {
      polygonDrawerRef.current.disable();
    }
  }, [isDrawing]);

  // Handle map layer changes
  useEffect(() => {
    if (leafletMapRef.current && currentTileLayerRef.current) {
      leafletMapRef.current.removeLayer(currentTileLayerRef.current);
      const newLayer = L.tileLayer(mapLayers[mapLayer], {
        attribution: mapAttributions[mapLayer],
      }).addTo(leafletMapRef.current);
      currentTileLayerRef.current = newLayer;
    }
  }, [mapLayer]);

  // Draw selected zone
  useEffect(() => {
    if (leafletMapRef.current && layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      
      // Only show the selected zone if we are not currently drawing a new one
      if (!isDrawing && selectedZoneGeometry) {
        L.geoJSON(selectedZoneGeometry, {
          style: {
            color: '#3b82f6',
            weight: 3,
            fillColor: '#3b82f6',
            fillOpacity: 0.2
          }
        }).addTo(layerGroupRef.current);
        
        // Fit bounds
        const bounds = L.geoJSON(selectedZoneGeometry).getBounds();
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedZoneGeometry, isDrawing]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full rounded-xl overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}
