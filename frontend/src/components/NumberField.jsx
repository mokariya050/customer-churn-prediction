import React from 'react';

export default function NumberField({ id, label, required, value, onChange, error, placeholder, min, max, step, hint }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(id, e.target.value)}
        className={error ? 'error' : ''}
        required={required}
      />
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error show">{error}</span>}
    </div>
  );
}
