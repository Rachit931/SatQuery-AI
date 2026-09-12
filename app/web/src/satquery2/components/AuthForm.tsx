'use client';

import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: (user: User) => void;
  redirectUrl?: string;
  className?: string;
}

export default function AuthForm({
  initialMode = 'signin',
  onSuccess,
  redirectUrl,
  className = '',
}: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          setSuccessMessage('Signed in successfully.');
          if (onSuccess) {
            onSuccess(data.user);
          } else if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data.session && data.user) {
          setSuccessMessage('Account created and signed in successfully!');
          if (onSuccess) {
            onSuccess(data.user);
          } else if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        } else if (data.user) {
          setSuccessMessage(
            'Account created! If confirmation is enabled on your Supabase project, please check your email inbox to verify your account before signing in.',
          );
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected authentication error occurred.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mode Switcher Tabs */}
      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'signin'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LogIn size={14} /> Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'signup'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus size={14} /> Sign Up
        </button>
      </div>

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="auth-email" className="block text-xs font-bold text-slate-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-xs font-bold text-slate-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          {mode === 'signup' && (
            <p className="text-[10px] text-slate-500 mt-1">Must be at least 6 characters</p>
          )}
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5 text-emerald-300 text-xs animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {mode === 'signin' ? 'Signing In…' : 'Registering…'}
            </>
          ) : mode === 'signin' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
