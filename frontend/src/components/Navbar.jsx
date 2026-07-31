import React, { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ view, onNewChat, onManual, onHome }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Glow line at bottom */}
      <div className="nav-glow" aria-hidden />

      <div className="navbar-inner">
        {/* Left: Logo + Brand */}
        <button className="nav-brand" onClick={onHome} aria-label="Home">
          <div className="nav-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="white"/>
            </svg>
          </div>
          <div className="nav-brand-text">
            <span className="nav-title">ChurnPredictor</span>
            <span className="nav-ai-tag">AI</span>
          </div>
        </button>

        {/* Center: Status badge */}
        <div className="nav-center">
          <div className="nav-badge">
            <span className="badge-pulse" />
            <span className="badge-text">Machine Learning + LLM</span>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="nav-actions">
          <button className="nav-action-btn ghost" onClick={onNewChat}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span className="nav-action-label">New Chat</span>
          </button>
          <div className="nav-sep" />
          <button className="nav-action-btn accent" onClick={onManual}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="3" width="14" height="18" rx="2"/>
              <path d="M9 8h6M9 12h6M9 16h3"/>
            </svg>
            <span className="nav-action-label">Manual Entry</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
