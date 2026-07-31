import React from 'react';
import './Hero.css';

const FEATURES = [
  { icon: '🧠', label: 'Natural Language Input' },
  { icon: '⚡', label: 'Instant Prediction' },
  { icon: '📊', label: 'AI Explanation' },
];

export default function Hero({ onStart, onManual }) {
  return (
    <section className="hero">
      <div className="hero-inner">

        {/* Left: text content */}
        <div className="hero-content">
          <div className="hero-eyebrow animate-fade-up">
            <span className="eyebrow-dot" />
            AI-Powered Telecom Analytics
          </div>

          <h1 className="hero-title animate-fade-up delay-1">
            Predict Customer<br />
            <span className="gradient-text">Churn Using AI</span>
          </h1>

          <p className="hero-subtitle animate-fade-up delay-2">
            Describe a telecom customer naturally. The AI understands your message,
            extracts customer details, runs the machine learning model and explains
            the prediction with business insights.
          </p>

          <div className="hero-cta animate-fade-up delay-3">
            <button className="btn btn-primary hero-btn-primary" onClick={onStart}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Start Prediction
            </button>
            <button className="btn btn-secondary hero-btn-secondary" onClick={onManual}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6M9 16h6M9 8h3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              </svg>
              Manual Form
            </button>
          </div>

          <div className="hero-features animate-fade-up delay-4">
            {FEATURES.map(f => (
              <div key={f.label} className="hero-feature">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: visual */}
        <div className="hero-visual animate-fade-in delay-2">
          <div className="vis-card">
            {/* Chat preview mockup */}
            <div className="vis-header">
              <div className="vis-dots">
                <span /><span /><span />
              </div>
              <span className="vis-label">AI Churn Analyst</span>
            </div>
            <div className="vis-messages">
              <div className="vis-msg bot">
                <div className="vis-avatar bot" />
                <div className="vis-bubble">
                  Hello! I'm your AI Churn Analyst. Describe a customer and I'll predict their risk.
                </div>
              </div>
              <div className="vis-msg user">
                <div className="vis-bubble user">
                  Male, 24 months, Fiber optic, month-to-month, $85/mo, electronic check…
                </div>
                <div className="vis-avatar user" />
              </div>
              <div className="vis-msg bot">
                <div className="vis-avatar bot" />
                <div className="vis-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
            {/* Result preview */}
            <div className="vis-result">
              <div className="vis-result-left">
                <div className="vis-result-label">Churn Risk</div>
                <div className="vis-result-val high">HIGH · 78%</div>
              </div>
              <div className="vis-ring">
                <svg viewBox="0 0 60 60" width="60" height="60">
                  <circle cx="30" cy="30" r="23" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                  <circle cx="30" cy="30" r="23" fill="none" stroke="#F43F5E" strokeWidth="5"
                    strokeLinecap="round" strokeDasharray="144.5" strokeDashoffset="31.8"
                    transform="rotate(-90 30 30)"/>
                </svg>
                <span className="vis-ring-val">78%</span>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="vis-badge badge-1">RandomForest ✓</div>
          <div className="vis-badge badge-2">Groq LLM ✓</div>
          <div className="vis-badge badge-3">
            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#10B981"/></svg>
            Live
          </div>
        </div>

      </div>
    </section>
  );
}
