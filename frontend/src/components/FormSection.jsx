import React from 'react';

export default function FormSection({ icon, title, children }) {
  return (
    <div className="form-section">
      <div className="fs-header">
        <span className="fs-icon">{icon}</span>
        <h3 className="fs-title">{title}</h3>
      </div>
      <div className="fs-body">
        {children}
      </div>
    </div>
  );
}
