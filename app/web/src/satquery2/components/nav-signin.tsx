'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, Shield, CheckCircle } from 'lucide-react';
import './nav-signin.css';

export default function NavSignIn() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 1500);
  };

  const modalContent = isOpen && mounted ? (
    <div
      className="signin-modal-backdrop"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-signin-title"
    >
      <div
        className="signin-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="signin-modal-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="signin-modal-badge">
          <span className="signin-modal-dot" />
          <span>Operational Ground Terminal</span>
        </div>

        <h3 id="modal-signin-title" className="signin-modal-title">
          Sign in to SatQuery
        </h3>
        <p className="signin-modal-subtitle">
          Enter your mission credentials to access real-time satellite intelligence.
        </p>

        {submitted ? (
          <div className="signin-modal-success">
            <CheckCircle size={32} className="signin-modal-success-icon" />
            <h4>Credentials Verified</h4>
            <p>Orbital uplink established.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="signin-modal-form">
            <div className="signin-modal-field">
              <label htmlFor="modal-email">Mission Email</label>
              <div className="signin-modal-input-wrap">
                <Mail size={15} className="signin-modal-icon" />
                <input
                  id="modal-email"
                  type="email"
                  required
                  placeholder="officer@satquery.space"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="signin-modal-field">
              <div className="signin-modal-field-header">
                <label htmlFor="modal-password">Security Clearance Token</label>
              </div>
              <div className="signin-modal-input-wrap">
                <Lock size={15} className="signin-modal-icon" />
                <input
                  id="modal-password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="signin-modal-submit">
              <span>Authorize Mission Access</span>
              <Shield size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSubmitted(false);
          setIsOpen(true);
        }}
        className="nav-signin-btn"
        aria-label="Sign In"
      >
        Sign In
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
