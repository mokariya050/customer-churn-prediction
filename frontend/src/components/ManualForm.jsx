import React from 'react';
import FormSection from './FormSection';
import SelectField from './SelectField';
import NumberField from './NumberField';
import ResultCard  from './ResultCard';
import CustomerPanel from './CustomerPanel';
import { useChurnForm } from '../hooks/useChurnForm';
import './ManualForm.css';

const YES_NO        = [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }];
const GENDER_OPTS   = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }];
const SENIOR_OPTS   = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];
const INTERNET_OPTS = [
  { value: 'DSL',          label: 'DSL' },
  { value: 'Fiber optic',  label: 'Fiber optic' },
  { value: 'No',           label: 'No Internet' },
];
const CONTRACT_OPTS = [
  { value: 'Month-to-month', label: 'Month-to-month' },
  { value: 'One year',       label: 'One year' },
  { value: 'Two year',       label: 'Two year' },
];
const PAYMENT_OPTS = [
  { value: 'Electronic check',          label: 'Electronic check' },
  { value: 'Mailed check',              label: 'Mailed check' },
  { value: 'Bank transfer (automatic)', label: 'Bank transfer (auto)' },
  { value: 'Credit card (automatic)',   label: 'Credit card (auto)' },
];

export default function ManualForm({ onBack }) {
  const {
    form, errors, loading, result, apiError,
    hasPhone, hasInternet,
    handleChange, handleSubmit,
  } = useChurnForm();

  return (
    <div className="mf-page">
      {/* Page header */}
      <div className="mf-page-header animate-fade-up">
        <button className="btn btn-ghost mf-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to AI Chat
        </button>
        <h2 className="mf-heading">
          <span className="gradient-text">Manual</span> Entry Form
        </h2>
        <p className="mf-subheading">
          Fill in customer details using the structured form below.
          Required fields are marked with an asterisk.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mf-form animate-fade-up delay-1">

        {/* § 1 — Demographics */}
        <FormSection icon="👤" title="Customer Demographics">
          <div className="form-grid">
            <SelectField id="gender"        label="Gender"         required value={form.gender}        onChange={handleChange} options={GENDER_OPTS}  error={errors.gender} />
            <SelectField id="SeniorCitizen" label="Senior Citizen" required value={form.SeniorCitizen} onChange={handleChange} options={SENIOR_OPTS}  error={errors.SeniorCitizen} />
            <SelectField id="Partner"       label="Partner"        required value={form.Partner}       onChange={handleChange} options={YES_NO}        error={errors.Partner} />
            <SelectField id="Dependents"    label="Dependents"     required value={form.Dependents}    onChange={handleChange} options={YES_NO}        error={errors.Dependents} />
            <NumberField id="tenure" label="Tenure (months)" required value={form.tenure} onChange={handleChange}
              placeholder="e.g. 24" min={0} max={72} hint="Range: 0–72" error={errors.tenure} />
          </div>
        </FormSection>

        {/* § 2 — Services */}
        <FormSection icon="📡" title="Services Subscribed">
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <SelectField id="PhoneService"   label="Phone Service"   required value={form.PhoneService}   onChange={handleChange} options={YES_NO} error={errors.PhoneService} />
            <div className={`field ${!hasPhone ? 'field-dimmed' : ''}`}>
              <label htmlFor="MultipleLines">Multiple Lines</label>
              <select id="MultipleLines" value={form.MultipleLines}
                onChange={e => handleChange('MultipleLines', e.target.value)} disabled={!hasPhone}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <SelectField id="InternetService" label="Internet Service" required value={form.InternetService} onChange={handleChange} options={INTERNET_OPTS} error={errors.InternetService} />
          </div>
          <div className={`addon-section ${!hasInternet ? 'dimmed' : ''}`}>
            <div className="addon-heading">Internet Add-ons {!hasInternet && '(disabled — no internet)'}</div>
            <div className="form-grid">
              {[['OnlineSecurity','Online Security'],['OnlineBackup','Online Backup'],
                ['DeviceProtection','Device Protection'],['TechSupport','Tech Support'],
                ['StreamingTV','Streaming TV'],['StreamingMovies','Streaming Movies'],
              ].map(([id, label]) => (
                <SelectField key={id} id={id} label={label} value={form[id]} onChange={handleChange} options={YES_NO} />
              ))}
            </div>
          </div>
        </FormSection>

        {/* § 3 — Billing */}
        <FormSection icon="💳" title="Billing & Contract">
          <div className="form-grid">
            <SelectField id="Contract"        label="Contract Type"     required value={form.Contract}        onChange={handleChange} options={CONTRACT_OPTS} error={errors.Contract} />
            <SelectField id="PaperlessBilling" label="Paperless Billing"          value={form.PaperlessBilling} onChange={handleChange} options={YES_NO} />
            <SelectField id="PaymentMethod"   label="Payment Method"    required value={form.PaymentMethod}   onChange={handleChange} options={PAYMENT_OPTS} error={errors.PaymentMethod} />
            <NumberField id="MonthlyCharges" label="Monthly Charges ($)" required value={form.MonthlyCharges} onChange={handleChange} placeholder="e.g. 65.50" min={0} step={0.01} error={errors.MonthlyCharges} />
            <NumberField id="TotalCharges"   label="Total Charges ($)"   required value={form.TotalCharges}   onChange={handleChange} placeholder="e.g. 1500.00" min={0} step={0.01} error={errors.TotalCharges} />
          </div>
        </FormSection>

        {/* Submit */}
        <button type="submit" className={`btn-predict${loading ? ' loading' : ''}`} disabled={loading}>
          <span className="spinner" />
          <span className="btn-label">{loading ? 'Analysing…' : '🔍 Predict Churn'}</span>
        </button>

        {apiError && (
          <div className="mf-api-error">⚠️ {apiError}</div>
        )}
      </form>

      {/* Result */}
      {result && (
        <div className="mf-result animate-scale-in">
          <ResultCard
            prediction={result.prediction}
            probability={result.probability}
            explanation={null}
          />
          <CustomerPanel data={result.customer_data || form} />
        </div>
      )}
    </div>
  );
}
