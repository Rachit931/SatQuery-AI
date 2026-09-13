'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  History as HistoryIcon,
  Search,
  Sparkles,
  Cpu,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { supabase } from '@/services/supabase';
import {
  getAnalysisHistory,
  deleteAnalysisHistory,
  type AnalysisHistoryItem,
} from '@/services/historyService';
import Navbar from '@/components/Navbar';

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const [_currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 1. Fetch history defined with useCallback
  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getAnalysisHistory();
    if (result.error) {
      setError(result.error);
      setHistoryItems([]);
    } else {
      setHistoryItems(result.data || []);
    }
    setLoading(false);
  }, []);

  // 2. Auth check & session sync
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session?.user) {
          router.replace('/login?redirect=/history');
          return;
        }

        setCurrentUser(session.user);
        setAuthChecking(false);
        void fetchHistory();
      } catch {
        if (mounted) {
          router.replace('/login?redirect=/history');
        }
      }
    }

    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        router.replace('/login?redirect=/history');
      } else {
        setCurrentUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, fetchHistory]);

  // 3. Delete history item
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this record from your history?')) {
      return;
    }

    setDeletingId(id);
    const { success, error: delError } = await deleteAnalysisHistory(id);
    setDeletingId(null);

    if (!success) {
      setFeedback({
        type: 'error',
        message: delError || 'Could not delete history item.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      if (expandedItemId === id) setExpandedItemId(null);
      setFeedback({
        type: 'success',
        message: 'Analysis record deleted.',
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // 4. Filtered items
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.answer && item.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.model_used && item.model_used.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.analysis_type && item.analysis_type.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedType === 'All' ||
        (item.analysis_type &&
          item.analysis_type.toLowerCase() === selectedType.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [historyItems, searchQuery, selectedType]);

  // Unique analysis types for filtering
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    historyItems.forEach((item) => {
      if (item.analysis_type) set.add(item.analysis_type);
    });
    return ['All', ...Array.from(set)];
  }, [historyItems]);

  // Summary statistics
  const avgConfidence = useMemo(() => {
    const withConf = historyItems.filter((i) => typeof i.confidence === 'number' && i.confidence > 0);
    if (!withConf.length) return null;
    const sum = withConf.reduce((acc, curr) => acc + (curr.confidence || 0), 0);
    return Math.round(sum / withConf.length);
  }, [historyItems]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#020609] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Verifying SatQuery authentication…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020609] text-white flex flex-col relative selection:bg-blue-600 selection:text-white font-sans">
      {/* Background imagery */}
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-center opacity-15"
        style={{ backgroundImage: "url('/watch-zone-bg.jpg')" }}
      />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.15),_transparent_70%)]" />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10 flex flex-col gap-6">
        {/* Feedback notification toast */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Page Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              <HistoryIcon size={14} /> Persistent User Activity
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Analysis History
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Audit trail of remote-sensing models, queries, and verified satellite observations associated with your account.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void fetchHistory()}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Refresh history"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link
              href="/watch-zone"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Watch Zone</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Summary Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3.5 backdrop-blur">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Queries
            </div>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {historyItems.length}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3.5 backdrop-blur">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Average Confidence
            </div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {avgConfidence !== null ? `${avgConfidence}%` : '—'}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-900/50 border border-white/5 rounded-xl p-3.5 backdrop-blur">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cloud Storage Status
            </div>
            <div className="text-xs font-semibold text-blue-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>RLS Protected (Supabase)</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by query, answer keyword, or model…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {availableTypes.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedType === type
                      ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 animate-pulse flex flex-col gap-3"
              >
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800/60 rounded w-2/3" />
                <div className="h-3 bg-slate-800/40 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <AlertTriangle size={32} className="text-rose-400" />
            <h3 className="text-base font-bold text-white">Failed to Load History</h3>
            <p className="text-xs text-slate-400 max-w-md">{error}</p>
            <button
              onClick={() => void fetchHistory()}
              className="mt-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <Compass size={28} />
            </div>
            <h3 className="text-base font-bold text-white">No query history yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              Run your first satellite analysis or generate a zone report in Watch Zone, and it will appear here automatically.
            </p>
            <Link
              href="/watch-zone"
              className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2"
            >
              <span>Explore Watch Zone</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isExpanded = expandedItemId === item.id;
              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900/50 hover:bg-slate-900/80 border transition-all rounded-2xl p-5 backdrop-blur ${
                    isExpanded
                      ? 'border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20'
                      : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {item.analysis_type && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300">
                            {item.analysis_type}
                          </span>
                        )}
                        {item.model_used && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                            <Cpu size={10} />
                            {item.model_used}
                          </span>
                        )}
                        {item.confidence !== null && item.confidence > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.confidence >= 85
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                                : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                            }`}
                          >
                            {item.confidence}% Conf
                          </span>
                        )}
                        {item.zone_id && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 border border-white/10 text-slate-300 flex items-center gap-1">
                            <Layers size={10} />
                            Zone Linked
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="text-left text-sm sm:text-base font-bold text-white hover:text-blue-300 transition-colors flex items-start gap-2 cursor-pointer w-full"
                      >
                        <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <span>{item.query}</span>
                      </button>

                      {item.answer && !isExpanded && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {item.answer}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(item.created_at)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={(e) => void handleDelete(item.id, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete history record"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                          title={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                          <span className="text-[11px] hidden sm:inline">{isExpanded ? 'Hide' : 'Details'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-4 animate-in fade-in duration-200">
                      {item.answer && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Analysis Result / AI Output
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {item.answer}
                          </div>
                        </div>
                      )}

                      {/* Structured result data if available */}
                      {item.result_data && Object.keys(item.result_data).length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Structured Evidence & Telemetry
                          </div>
                          <pre className="bg-black/60 border border-white/5 rounded-xl p-3.5 text-[11px] font-mono text-blue-300/90 overflow-x-auto custom-scrollbar">
                            {JSON.stringify(item.result_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-2 border-t border-white/5">
                        <span className="font-mono">Record ID: {item.id}</span>
                        <Link
                          href="/watch-zone"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          Inspect live in Watch Zone <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
