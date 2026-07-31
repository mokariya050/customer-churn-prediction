import React from 'react';

export default function SelectField({ id, label, required, value, onChange, error, options, hint }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={e => onChange(id, e.target.value)}
        className={error ? 'error' : ''}
        required={required}
      >
        {required && <option value="">— Select —</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error show">{error}</span>}
    </div>
  );
}
