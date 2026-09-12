'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { supabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
    </span>
  );
}

export interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = '' }: NavbarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initial session
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Workspace', href: '/#workspace' },
    { label: 'Watch Zone', href: '/watch-zone' },
    { label: 'Offline Mode', href: '/#offline' },
    { label: 'History', href: '/history' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname === href;
  };

  return (
    <header
      className={`site-header sticky top-0 z-50 backdrop-blur-xl bg-[#020609]/85 border-b border-white/10 px-6 py-4 flex items-center justify-between transition-colors ${className}`}
    >
      {/* Brand */}
      <Link className="brand flex items-center gap-2.5" href="/" aria-label="SatQuery home">
        <BrandMark />
        <span className="font-bold tracking-wider text-base bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          SatQuery
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`transition-all relative py-1 ${
                active
                  ? 'text-blue-400 font-semibold border-b-2 border-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : 'text-slate-300 hover:text-white hover:text-blue-300'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Auth controls */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <UserIcon size={12} className="text-blue-400" />
              <span className="max-w-[140px] truncate font-medium">{currentUser.email}</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/30 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn size={13} /> Sign In
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#020609]/95 backdrop-blur-2xl border-b border-white/10 p-5 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm py-2 px-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {currentUser && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 px-3">
              <span className="truncate">{currentUser.email}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
