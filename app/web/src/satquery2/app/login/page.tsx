'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, LogOut, Shield, Telescope } from 'lucide-react';
import { supabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';
import AuthForm from '@/components/AuthForm';

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
    </span>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectTarget = rawRedirect && rawRedirect.startsWith('/') ? rawRedirect : '/watch-zone';

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    router.push(redirectTarget);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <main className="min-h-screen bg-[#020609] text-slate-200 overflow-x-hidden flex flex-col font-sans relative">
      {/* Background Ambience */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/watch-zone-bg.jpg)' }}
      />
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none mix-blend-multiply bg-black" />
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/50 via-transparent to-transparent" />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <Link className="brand" href="/" aria-label="SatQuery home">
          <Mark />
          <span>SatQuery</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/#workspace" className="text-slate-400 hover:text-white transition-colors">
            Workspace
          </Link>
          <Link href="/watch-zone" className="text-slate-400 hover:text-white transition-colors">
            Watch Zone
          </Link>
        </nav>
        <Link
          href={redirectTarget}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
        >
          <ArrowLeft size={13} /> Return to App
        </Link>
      </header>

      {/* Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-8">
        <div className="w-full max-w-md bg-slate-900/80 border border-blue-500/30 backdrop-blur-xl rounded-2xl p-7 sm:p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col relative overflow-hidden">
          {/* Subtle cosmic glow */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),_transparent_65%)] pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative z-10 flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Telescope size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              SatQuery Cloud
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight relative z-10 mb-1">
            {currentUser ? 'Session Active' : 'Sign in to SatQuery'}
          </h1>
          <p className="text-xs text-slate-400 mb-6 relative z-10">
            {currentUser
              ? 'You are currently authenticated with Supabase.'
              : 'Access your persistent satellite watch zones, alerts, and custom analytics.'}
          </p>

          <div className="relative z-10">
            {checkingAuth ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Checking session…</span>
              </div>
            ) : currentUser ? (
              <div className="flex flex-col gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Signed In</div>
                    <div className="text-sm font-medium text-white break-all">{currentUser.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(redirectTarget)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
                >
                  Continue to {redirectTarget === '/watch-zone' ? 'Watch Zone' : 'Workspace'} →
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            ) : (
              <AuthForm onSuccess={handleAuthSuccess} redirectUrl={redirectTarget} />
            )}
          </div>

          <div className="relative z-10 mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield size={12} className="text-blue-400" /> Row-Level Secured (RLS)
            </span>
            <span>Supabase Cloud</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 py-4 px-6 text-center text-xs text-slate-600 border-t border-white/5 bg-black/20">
        © 2026 SatQuery. Earth intelligence, made clear.
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020609] flex items-center justify-center text-slate-400 text-xs">
          Loading authentication…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
