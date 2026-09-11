'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cloud,
  Calendar,
  Download,
  FileText,
  Layers,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Plus,
  Search,
  Share2,
  ShieldAlert,
  Telescope,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import SpaceScene from '../space-scene';
import NebulaBackground from '../nebula-background';
import { getZones, getZoneDetails, getObservations, getChangeDetection, getZoneAnalytics, type Zone, type Observation, type ChangeData, type ZoneAnalytics } from '@/services/satelliteService';

// Dynamically import the map component since it requires browser APIs
const WatchZoneMap = dynamic(() => import('@/components/map/WatchZoneMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center text-slate-500">
      Loading Map...
    </div>
  ),
});

const ImageCompareSlider = dynamic(
  () => import('@/components/map/ImageCompareSlider'),
  {
    ssr: false,
  },
);

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
    </span>
  );
}

export default function WatchZonePage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [changeData, setChangeData] = useState<ChangeData | null>(null);
  const [analytics, setAnalytics] = useState<ZoneAnalytics | null>(null);
  const [mapLayer, setMapLayer] = useState<'Satellite' | 'Street' | 'Terrain'>(
    'Satellite',
  );
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Changes' | 'Timeline' | 'Reports'
  >('Overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newZoneGeoJSON, setNewZoneGeoJSON] = useState<any>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [mapBounds, setMapBounds] = useState<string>('');

  useEffect(() => {
    // Load initial data
    getZones().then((data) => {
      setZones(data);
      if (data.length > 0) {
        handleSelectZone(data[0].id);
      }
    });
  }, []);

  const handleSelectZone = async (id: string) => {
    const zoneDetails = await getZoneDetails(id);
    if (zoneDetails) setSelectedZone(zoneDetails);

    const obs = await getObservations(id);
    setObservations(obs);

    const change = await getChangeDetection(id);
    setChangeData(change);

    const analyticsData = await getZoneAnalytics(id);
    setAnalytics(analyticsData);
  };

  const handleZoneCreated = (geojson: any) => {
    setNewZoneGeoJSON(geojson);
    setShowCreateModal(true);
    setIsDrawingMode(false);
  };

  const saveNewZone = () => {
    const newZone: Zone = {
      id: `custom-${Date.now()}`,
      name: "New Watch Zone",
      location: "Custom Coordinates",
      geometry: newZoneGeoJSON,
      area: 12.5,
      purpose: "Custom Monitoring",
      monitoringFrequency: "Weekly",
      satelliteSource: "Sentinel-2 (Mock)",
      cloudThreshold: 10,
      alertSensitivity: "High",
      status: 'Active',
      riskScore: 25,
      createdAt: new Date().toISOString().split('T')[0],
      lastScanAt: "Just now"
    };
    setZones([newZone, ...zones]);
    setSelectedZone(newZone);
    setShowCreateModal(false);
    setNewZoneGeoJSON(null);
  };

  const statusColors = {
    Active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Stable: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Moderate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'High Risk': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };

  return (
    <main className="min-h-screen bg-[#020609] text-slate-200 overflow-x-hidden flex flex-col font-sans relative">
      {/* Custom Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: 'url(/watch-zone-bg.jpg)' }} 
      />
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none mix-blend-multiply bg-black" />
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />

      {/* Top Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <Link className="brand" href="/" aria-label="SatQuery home">
          <Mark />
          <span>SatQuery</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#workspace"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Workspace
          </Link>
          <Link
            href="/watch-zone"
            className="text-blue-400 border-b-2 border-blue-500 pb-1 font-medium shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
          >
            Watch Zone
          </Link>
          <Link
            href="/#offline"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Offline Mode
          </Link>
        </nav>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 relative z-10 max-w-[1920px] mx-auto w-full h-[calc(100vh-76px)] min-h-[800px]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
          <button 
            onClick={() => setIsDrawingMode(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Create Watch Zone
          </button>

          <div className="flex items-center justify-between mt-2 mb-1 px-1">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              Your Zones
            </h3>
            <span className="bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
              {zones.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 relative z-10">
            {zones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => handleSelectZone(zone.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedZone?.id === zone.id
                    ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-800 relative group">
                  <img
                    src={zone.thumbnail || "/og.png"}
                    alt={zone.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {zone.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {zone.location}
                  </div>
                </div>
                <div
                  className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 font-medium ${
                    statusColors[zone.status as keyof typeof statusColors]
                  }`}
                >
                  {zone.status}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsDrawingMode(true)}
            className="w-full py-2.5 px-4 bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 text-slate-400 hover:text-white rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Plus size={16} /> Add New Zone
          </button>

          <div className="mt-4 mb-2">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase px-1">
              Monitoring Overview
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-start gap-3">
              <Activity className="text-emerald-400 mt-0.5" size={16} />
              <div>
                <div className="text-xl font-bold text-white">8</div>
                <div className="text-[10px] text-slate-400">Active Zones</div>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-start gap-3">
              <Search className="text-blue-400 mt-0.5" size={16} />
              <div>
                <div className="text-xl font-bold text-white">14</div>
                <div className="text-[10px] text-slate-400">
                  Changes Detected
                </div>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-start gap-3">
              <AlertTriangle className="text-rose-400 mt-0.5" size={16} />
              <div>
                <div className="text-xl font-bold text-white">3</div>
                <div className="text-[10px] text-slate-400">
                  Critical Alerts
                </div>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-start gap-3">
              <MapIcon className="text-emerald-400 mt-0.5" size={16} />
              <div>
                <div className="text-lg font-bold text-white">126 km²</div>
                <div className="text-[10px] text-slate-400">Total Coverage</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <Clock className="text-slate-400" size={16} />
            <div>
              <div className="text-sm font-bold text-white">2 hours ago</div>
              <div className="text-[10px] text-slate-400">Last Scan</div>
            </div>
          </div>

          <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
            <ShieldAlert className="text-amber-400 flex-shrink-0" size={20} />
            <div>
              <h4 className="text-xs font-bold text-amber-400 mb-1">
                DEMO MODE
              </h4>
              <p className="text-[10px] text-amber-200/70 leading-relaxed">
                Using simulated satellite data for demonstration. Ready for real
                Sentinel/Landsat integration.
              </p>
            </div>
          </div>
        </aside>

        {/* Center/Right Layout */}
        <div className="flex-1 flex flex-col gap-4 h-full min-w-0">
          {/* Top Row: Map and Zone Panel */}
          <div className="flex flex-col xl:flex-row gap-4 h-[55%] min-h-[400px]">
            {/* Main Map Area */}
            <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col p-1">
              <div className="absolute top-4 left-4 z-10 w-64">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search location (e.g. Delhi, Lat Long)"
                    className="w-full bg-black/60 border border-white/10 backdrop-blur rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
                  />
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <div className="bg-black/60 backdrop-blur border border-white/10 rounded-lg p-1.5 flex gap-1 shadow-lg">
                  {['Satellite', 'Street', 'Terrain'].map((layer) => (
                    <button
                      key={layer}
                      onClick={() => setMapLayer(layer as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        mapLayer === layer
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {layer}
                    </button>
                  ))}
                </div>
              </div>

              {isDrawingMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse">
                    Click on the map to draw a watch zone
                  </div>
                  <button 
                    onClick={() => setIsDrawingMode(false)}
                    className="bg-slate-900/80 backdrop-blur border border-white/20 text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <WatchZoneMap
                mapLayer={mapLayer}
                selectedZoneGeometry={selectedZone?.geometry}
                className="w-full h-full"
                onZoneCreated={handleZoneCreated}
                isDrawing={isDrawingMode}
                onBoundsChange={setMapBounds}
              />
            </div>

            {/* Selected Zone Panel */}
            {selectedZone && (
              <div className="w-full xl:w-80 bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">
                      {selectedZone.name}
                    </h2>
                    <div className="flex items-center text-slate-400 text-xs">
                      <MapPin size={12} className="mr-1" />{' '}
                      {selectedZone.location}
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 whitespace-nowrap ${statusColors[selectedZone.status]}`}
                  >
                    {selectedZone.status === 'High Risk' && (
                      <Activity size={12} />
                    )}
                    {selectedZone.status}
                  </div>
                </div>

                <div className="flex border-b border-white/10 mb-4">
                  {['Overview', 'Changes', 'Timeline', 'Reports'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 pb-2 text-xs font-medium text-center transition-colors relative ${
                        activeTab === tab
                          ? 'text-blue-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                  {activeTab === 'Overview' && (
                    <>
                      <div className="flex gap-4">
                        <div className="flex-1 grid grid-cols-[16px_1fr] gap-x-2 gap-y-2 items-center text-xs">
                          <MapIcon className="text-slate-500" size={14} />
                          <div className="flex justify-between">
                            <span className="text-slate-400">Area</span>
                            <span className="text-white font-medium">{selectedZone.area} km²</span>
                          </div>

                          <Activity className="text-slate-500" size={14} />
                          <div className="flex justify-between">
                            <span className="text-slate-400">Purpose</span>
                            <span className="text-white font-medium text-right ml-2 truncate" title={selectedZone.purpose}>{selectedZone.purpose}</span>
                          </div>

                          <Telescope className="text-slate-500" size={14} />
                          <div className="flex justify-between">
                            <span className="text-slate-400">Source</span>
                            <span className="text-white font-medium text-right">{selectedZone.satelliteSource}</span>
                          </div>

                          <Clock className="text-slate-500" size={14} />
                          <div className="flex justify-between">
                            <span className="text-slate-400">Freq</span>
                            <span className="text-white font-medium">{selectedZone.monitoringFrequency}</span>
                          </div>

                          <Cloud className="text-slate-500" size={14} />
                          <div className="flex justify-between">
                            <span className="text-slate-400">Clouds</span>
                            <span className="text-white font-medium">{selectedZone.cloudThreshold}%</span>
                          </div>
                        </div>
                        <div className="w-24 h-32 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-slate-800">
                          <img 
                            src={selectedZone.thumbnail || "/og.png"} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5 mt-auto">
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <div className="text-xs text-slate-400 mb-1">
                              Risk Score
                            </div>
                            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                              {selectedZone.riskScore}
                              <span className="text-sm text-slate-500 font-normal">
                                / 100
                              </span>
                            </div>
                          </div>
                          <div className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <ArrowUpRight size={12} /> 12%
                          </div>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                            style={{ width: `${selectedZone.riskScore}%` }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <div className="text-center">
                            <div className="text-[10px] text-slate-400">
                              Vegetation
                            </div>
                            <div className="text-xs text-rose-400 font-medium mt-0.5">
                              ↓ 12%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-400">
                              Built-up
                            </div>
                            <div className="text-xs text-emerald-400 font-medium mt-0.5">
                              ↑ 8%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-slate-400">
                              Water
                            </div>
                            <div className="text-xs text-blue-400 font-medium mt-0.5">
                              ↓ 4%
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'Changes' && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-slate-400 mb-1">Recent Detections</h4>
                      {(analytics?.recentChanges || []).map((change: any, i: number) => {
                        const styleMap: Record<string, string> = {
                          rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                          emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                          amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                          blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        };
                        const styles = styleMap[change.type] || styleMap.blue;
                        
                        return (
                          <div key={i} className={`border rounded-lg p-3 ${styles.split(' ').slice(0, 2).join(' ')}`}>
                            <div className={`text-xs font-bold mb-1 ${styles.split(' ')[2]}`}>
                              {change.amount ? `${change.amount} ` : ''}{change.title}
                            </div>
                            <div className="text-[10px] text-slate-400">{change.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'Timeline' && (
                    <div className="flex flex-col gap-3 relative pl-3 border-l border-slate-700 ml-2 py-1">
                      {(analytics?.timelineEvents || []).map((event: any, i: number) => {
                        const dotColor = ({
                          rose: 'bg-rose-500',
                          emerald: 'bg-emerald-500',
                          amber: 'bg-amber-500',
                          blue: 'bg-blue-500'
                        } as Record<string, string>)[event.type] || 'bg-blue-500';

                        return (
                          <div key={i} className="relative mt-2 first:mt-0">
                            <div className={`absolute w-2 h-2 rounded-full -left-[17px] top-1 ${dotColor}`} />
                            <div className="text-xs font-bold text-white">{event.title}</div>
                            <div className="text-[10px] text-slate-400">{event.time}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'Reports' && (
                    <div className="flex flex-col gap-2">
                      <button className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-lg transition-colors text-left">
                        <FileText size={16} className="text-blue-400" />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white">Monthly Assessment (Aug)</div>
                          <div className="text-[10px] text-slate-400">PDF • 2.4 MB</div>
                        </div>
                        <Download size={14} className="text-slate-500" />
                      </button>
                      <button className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-lg transition-colors text-left">
                        <FileText size={16} className="text-emerald-400" />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white">Risk Analysis Report</div>
                          <div className="text-[10px] text-slate-400">PDF • 1.1 MB</div>
                        </div>
                        <Download size={14} className="text-slate-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Area: Panels */}
          <div className="flex-shrink-0">
            {/* All 4 panels in one row */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 h-[280px]">
              {/* Satellite Comparison */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white">
                    Satellite Comparison
                  </h3>
                  <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                    <Maximize2 size={12} /> View Fullscreen
                  </button>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden relative border border-white/10">
                  <ImageCompareSlider
                    beforeImage={mapBounds ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${mapBounds}&bboxSR=4326&size=800,400&f=image` : observations[0]?.image || '/watch-zone-bg.jpg'}
                    afterImage={mapBounds ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${mapBounds}&bboxSR=4326&size=800,400&f=image` : observations[1]?.image || '/watch-zone-bg.jpg'}
                    beforeLabel={`Before\n${changeData?.previousObservation.date || ''}`}
                    afterLabel={`After\n${changeData?.currentObservation.date || ''}`}
                    beforeImageClass={mapBounds ? "contrast-[1.2] brightness-90 sepia-[.3]" : ""}
                  />
                </div>
              </div>

              {/* Change Detection Result */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col overflow-hidden">
                <h3 className="text-sm font-bold text-white mb-4">
                  Change Detection Result
                </h3>

                {changeData?.detected ? (
                  <div className="flex-1 flex flex-col">
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mb-4 w-max shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                      <AlertTriangle size={16} /> Significant Change Detected
                    </div>

                    <div className="grid grid-cols-[140px_1fr] gap-y-3 text-xs mb-4">
                      <div className="text-slate-400">Change Type:</div>
                      <div className="text-white font-medium">
                        {changeData.type}
                      </div>

                      <div className="text-slate-400">Affected Area:</div>
                      <div className="text-white font-medium">
                        {changeData.affectedArea} hectares
                      </div>

                      <div className="text-slate-400">Confidence:</div>
                      <div className="text-rose-400 font-medium">
                        {changeData.confidence}%
                      </div>

                      <div className="text-slate-400">Severity:</div>
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          {changeData.severity}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="text-[10px] font-bold text-slate-300 mb-1">
                        AI EXPLANATION
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
                        "The monitored region shows a significant increase in
                        built-up surface compared with the previous observation.
                        Approximately {changeData.affectedArea} hectares appear
                        to have changed from vegetation/open land to constructed
                        surfaces. The detected pattern is consistent with recent
                        infrastructure development."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                    No significant changes detected
                  </div>
                )}
              </div>

              {/* Change Analytics */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white">
                    Change Analytics
                  </h3>
                  <select className="bg-slate-800 border border-white/10 rounded-md text-xs px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <div className="flex-1 flex items-center gap-6">
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.pieData || []}
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {(analytics?.pieData || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                          }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-xl font-bold text-white">
                        {analytics?.pieData?.reduce((a: number, b: any) => a + b.value, 0) || 0}
                      </div>
                      <div className="text-[9px] text-slate-400 text-center leading-tight">
                        Total<br />Changes
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    {(analytics?.pieData || []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-white font-medium">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Change Timeline */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white">
                    Change Timeline
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-400" /> No
                      Change
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />{' '}
                      Minor
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />{' '}
                      Moderate
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> Major
                    </span>
                  </div>
                </div>
                <div className="flex-1 w-full h-[150px] relative -ml-4 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics?.timelineData || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="intensity"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{
                          r: 4,
                          fill: '#3b82f6',
                          stroke: '#fff',
                          strokeWidth: 1,
                        }}
                        activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4 h-[240px]">
              {/* Recent Alerts */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white">
                    Recent Alerts
                  </h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300">
                    View All
                  </button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1">
                  <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <AlertTriangle size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">
                        Construction activity detected
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Yamuna Flood Watch
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0">
                      2 hours ago
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <AlertCircle size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">
                        Vegetation loss detected
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Aravalli Forest
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0">
                      1 day ago
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">
                        Scheduled scan completed
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Farmland Zone
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0">
                      2 days ago
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <AlertCircle size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">
                        Water level change detected
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Yamuna Flood Watch
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0">
                      4 days ago
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Report */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center overflow-hidden">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Generate Report
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Generate a detailed PDF report with satellite
                      observations, change analysis and insights.
                    </p>
                  </div>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors mb-3">
                  Generate Report
                </button>

                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg border border-white/5 text-[10px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Download size={12} /> Download Zone Data
                  </button>
                  <button className="flex-1 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg border border-white/5 text-[10px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Share2 size={12} /> Share Zone
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.1),_transparent_60%)] pointer-events-none" />
            
            <h2 className="text-xl font-bold text-white mb-1 relative z-10">Save Watch Zone</h2>
            <p className="text-sm text-slate-400 mb-6 relative z-10">You have drawn a new region on the map. Enter details to begin monitoring.</p>
            
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Zone Name</label>
                <input type="text" defaultValue="New Watch Zone" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Purpose</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option>Custom Monitoring</option>
                    <option>Flood Monitoring</option>
                    <option>Deforestation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Frequency</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option>Weekly</option>
                    <option>Daily</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Coordinates</label>
                <div className="bg-black/60 border border-white/5 rounded-lg p-3 text-[10px] text-slate-500 font-mono h-24 overflow-y-auto">
                  {JSON.stringify(newZoneGeoJSON, null, 2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8 relative z-10">
              <button 
                onClick={() => { setShowCreateModal(false); setNewZoneGeoJSON(null); }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveNewZone}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-colors"
              >
                Save Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
