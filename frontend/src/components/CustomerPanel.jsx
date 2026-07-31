import React from 'react';
import './CustomerPanel.css';

const FIELDS = [
  { key: 'gender',          label: 'Gender',          icon: '👤' },
  { key: 'SeniorCitizen',   label: 'Senior Citizen',  icon: '🎓', format: v => v == 1 ? 'Yes' : 'No' },
  { key: 'Partner',         label: 'Partner',          icon: '💍' },
  { key: 'Dependents',      label: 'Dependents',       icon: '👨‍👩‍👦' },
  { key: 'tenure',          label: 'Tenure',           icon: '📅', format: v => `${v} months` },
  { key: 'PhoneService',    label: 'Phone Service',    icon: '📱' },
  { key: 'InternetService', label: 'Internet',         icon: '🌐' },
  { key: 'Contract',        label: 'Contract',         icon: '📄' },
  { key: 'PaymentMethod',   label: 'Payment',          icon: '💳' },
  { key: 'MonthlyCharges',  label: 'Monthly Charges',  icon: '💰', format: v => `$${v}` },
  { key: 'TotalCharges',    label: 'Total Charges',    icon: '💵', format: v => `$${v}` },
  { key: 'OnlineSecurity',  label: 'Online Security',  icon: '🔒' },
  { key: 'TechSupport',     label: 'Tech Support',     icon: '🛠️' },
  { key: 'StreamingTV',     label: 'Streaming TV',     icon: '📺' },
];

export default function CustomerPanel({ data }) {
  if (!data) return null;

  return (
    <div className="cp-card">
      <div className="cp-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
        Customer Profile Summary
      </div>
      <div className="cp-grid">
        {FIELDS.map(f => {
          const val = data[f.key];
          if (val === null || val === undefined) return null;
          return (
            <div key={f.key} className="cp-item">
              <span className="cp-icon">{f.icon}</span>
              <div className="cp-info">
                <div className="cp-label">{f.label}</div>
                <div className="cp-value">{f.format ? f.format(val) : String(val)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
