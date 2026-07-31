import React, { useEffect, useRef, useState } from 'react';
import './ResultCard.css';

function CircularProgress({ value, isChurn }) {
  const circumference = 2 * Math.PI * 42;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (value / 100) * circumference);
    }, 200);
    return () => clearTimeout(timer);
  }, [value, circumference]);

  return (
    <div className="rc-circle">
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle cx="50" cy="50" r="42" fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
        <circle cx="50" cy="50" r="42" fill="none"
          stroke={isChurn ? '#F43F5E' : '#10B981'} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="rc-circle-inner">
        <span className={`rc-circle-val ${isChurn ? 'churn' : 'safe'}`}>{value}%</span>
        <span className="rc-circle-label">probability</span>
      </div>
    </div>
  );
}

export default function ResultCard({ prediction, probability, explanation }) {
  const isChurn = prediction === 'Yes';
  const probPct = probability !== null ? Math.round(probability * 100) : null;

  const riskLevel = probPct >= 70 ? 'High' : probPct >= 40 ? 'Medium' : 'Low';
  const confidence = probPct >= 70 || probPct <= 30 ? 'High' : 'Medium';

  return (
    <div className="result-card">

      {/* Top: Status banner */}
      <div className={`rc-banner ${isChurn ? 'churn' : 'safe'}`}>
        <div className="rc-banner-icon">{isChurn ? '⚠️' : '✅'}</div>
        <div className="rc-banner-text">
          <div className="rc-banner-title">
            {isChurn ? 'High Churn Risk Detected' : 'Low Churn Risk'}
          </div>
          <div className="rc-banner-sub">
            {isChurn
              ? 'This customer is likely to leave. Immediate action recommended.'
              : 'This customer appears stable. Continue monitoring.'}
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="rc-metrics">
        {/* Circle chart */}
        {probPct !== null && (
          <div className="rc-metric-circle">
            <CircularProgress value={probPct} isChurn={isChurn} />
          </div>
        )}

        {/* Stats */}
        <div className="rc-stats-grid">
          <div className="rc-stat">
            <div className="rc-stat-label">Prediction</div>
            <div className={`rc-stat-value ${isChurn ? 'churn' : 'safe'}`}>
              {isChurn ? 'Will Churn' : 'Will Stay'}
            </div>
          </div>
          <div className="rc-stat">
            <div className="rc-stat-label">Risk Level</div>
            <div className={`rc-stat-value risk-${riskLevel.toLowerCase()}`}>{riskLevel}</div>
          </div>
          <div className="rc-stat">
            <div className="rc-stat-label">Confidence</div>
            <div className="rc-stat-value">{confidence}</div>
          </div>
          {probPct !== null && (
            <div className="rc-stat">
              <div className="rc-stat-label">Probability</div>
              <div className="rc-stat-value">{probPct}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Probability bar */}
      {probPct !== null && (
        <div className="rc-bar-section">
          <div className="rc-bar-labels">
            <span>0%</span>
            <span className="rc-bar-center">Churn Probability</span>
            <span>100%</span>
          </div>
          <div className="rc-bar-track">
            <div className={`rc-bar-fill ${isChurn ? 'churn' : 'safe'}`}
              style={{ width: probPct + '%', transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 0.3s' }}
            />
            <div className="rc-bar-marker" style={{ left: probPct + '%' }} />
          </div>
        </div>
      )}

      {/* AI Explanation */}
      {explanation && (
        <div className="rc-explanation">
          <div className="rc-exp-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="currentColor"/>
            </svg>
            AI Business Insights
          </div>
          <div className="rc-exp-body">{explanation}</div>
        </div>
      )}
    </div>
  );
}
