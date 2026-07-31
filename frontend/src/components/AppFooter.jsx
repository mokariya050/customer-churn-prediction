import React from 'react';
import './AppFooter.css';

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="af-inner">
        <div className="af-left">
          <div className="af-brand">
            <div className="af-logo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="currentColor"/>
              </svg>
            </div>
            <span>ChurnPredictor AI</span>
          </div>
          <p className="af-copy">Built with Flask, React & Groq LLM</p>
        </div>
        <div className="af-right">
          <span>RandomForest · IBM Telco Dataset · 2025</span>
        </div>
      </div>
    </footer>
  );
}
