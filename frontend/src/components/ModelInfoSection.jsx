import React from 'react';
import './ModelInfoSection.css';

const MODEL_CARDS = [
  { label: 'ML Model', value: 'Random Forest', icon: '🧠', desc: '50-feature classifier trained on 7,043 customer records' },
  { label: 'AI Provider', value: 'Groq LLM', icon: '⚡', desc: 'Llama 3.3 70B via Groq for natural language understanding' },
  { label: 'Dataset', value: 'IBM Telco', icon: '📊', desc: '7,043 customers with 21 features including churn labels' },
  { label: 'Backend', value: 'Flask', icon: '🐍', desc: 'Python REST API with smart defaults and error handling' },
  { label: 'Frontend', value: 'React + Vite', icon: '⚛️', desc: 'Modern SPA with glassmorphism design system' },
  { label: 'Accuracy', value: '~80%', icon: '🎯', desc: 'With SMOTE resampling for balanced class distribution' },
];

const TECH_BADGES = [
  'Python', 'Flask', 'Random Forest', 'scikit-learn',
  'Groq', 'Llama 3.3', 'React', 'Vite',
  'JavaScript', 'HTML', 'CSS', 'Machine Learning',
];

export default function ModelInfoSection() {
  return (
    <section className="model-section">
      <div className="model-inner">

        {/* Section heading */}
        <div className="ms-header animate-fade-up">
          <div className="ms-badge">About the System</div>
          <h2 className="ms-title">
            Built with <span className="gradient-text">Modern AI</span>
          </h2>
          <p className="ms-subtitle">
            A full-stack machine learning application combining a trained
            RandomForest model with LLM-powered natural language understanding.
          </p>
        </div>

        {/* Info cards */}
        <div className="ms-grid animate-fade-up delay-1">
          {MODEL_CARDS.map(card => (
            <div key={card.label} className="ms-card glass-card">
              <div className="ms-card-icon">{card.icon}</div>
              <div className="ms-card-label">{card.label}</div>
              <div className="ms-card-value">{card.value}</div>
              <div className="ms-card-desc">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Tech badges */}
        <div className="ms-tech animate-fade-up delay-2">
          <div className="ms-tech-label">Tech Stack</div>
          <div className="ms-tech-badges">
            {TECH_BADGES.map(b => (
              <span key={b} className="ms-badge-pill">{b}</span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
