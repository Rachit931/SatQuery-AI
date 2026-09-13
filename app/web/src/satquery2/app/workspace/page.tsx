'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, Map as MapIcon, X } from 'lucide-react';
import { AIContextProvider } from '../../services/aiContextBridge';
import AIChatPanel from '../../components/ai/AIChatPanel';
import WorkspaceMap from '../../components/map/WorkspaceMap';

export default function WorkspacePage() {
  return (
    <AIContextProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-transparent text-slate-200 relative">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/workspace-bg.jpg)' }}
        >
          {/* Optional dark overlay so chat is more readable */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Top Header */}
        <header className="h-14 bg-[#05070A]/30 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-4 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <ArrowLeft size={16} />
              Back
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="SatQuery" className="h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="text-white font-bold tracking-wide">SatQuery <span className="text-blue-500">Workspace</span></span>
            </div>
          </div>
        </header>

          {/* Main Workspace Area */}
        <main className="flex-1 flex overflow-hidden relative z-10 w-full h-full">
          
          {/* Left: Chatbot taking up most of the screen */}
          <div className="flex-1 flex justify-center items-center h-full relative transition-all duration-300">
            <div className="w-full h-full mx-auto flex flex-col">
              <AIChatPanel />
            </div>
          </div>

          {/* Right: Map (Small Space) */}
          <div className="w-[350px] shrink-0 h-full border-l border-white/10 bg-[#05070A]/30 backdrop-blur-sm p-3 flex flex-col z-20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Live Location Data
              </span>
            </div>
            <div className="w-full h-[300px] rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-black/50">
              <WorkspaceMap />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/20 text-xs text-blue-200 backdrop-blur-md">
              <p className="mb-2 font-semibold">Location Sync Active</p>
              <p className="text-blue-300/80">The AI assistant is automatically receiving data from the map above, similar to Watch Zone.</p>
            </div>
          </div>
        </main>
      </div>
    </AIContextProvider>
  );
}
