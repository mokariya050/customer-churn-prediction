import { useState, useCallback } from 'react';
import { predictChurn } from '../api/predict';

const INITIAL_FORM = {
  gender: '',
  SeniorCitizen: '',
  Partner: '',
  Dependents: '',
  tenure: '',
  PhoneService: '',
  MultipleLines: 'No',
  InternetService: '',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: '',
  PaperlessBilling: 'No',
  PaymentMethod: '',
  MonthlyCharges: '',
  TotalCharges: '',
};

const REQUIRED = [
  'gender', 'SeniorCitizen', 'Partner', 'Dependents',
  'tenure', 'PhoneService', 'InternetService',
  'Contract', 'PaymentMethod', 'MonthlyCharges', 'TotalCharges',
];

export function useChurnForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { prediction, probability } | null
  const [apiError, setApiError] = useState(null);

  const handleChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear individual error on change
    if (errors[name]) {
      setErrors(prev => { const next = { ...prev }; delete next[name]; return next; });
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    for (const field of REQUIRED) {
      if (!form[field] || String(form[field]).trim() === '') {
        newErrors[field] = 'This field is required.';
      }
    }
    const tenure = parseFloat(form.tenure);
    if (!isNaN(tenure) && (tenure < 0 || tenure > 72)) {
      newErrors.tenure = 'Value must be between 0 and 72.';
    }
    const mc = parseFloat(form.MonthlyCharges);
    if (!isNaN(mc) && mc < 0) newErrors.MonthlyCharges = 'Must be ≥ 0.';
    const tc = parseFloat(form.TotalCharges);
    if (!isNaN(tc) && tc < 0) newErrors.TotalCharges = 'Must be ≥ 0.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setApiError(null);
    setResult(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await predictChurn(form);
      setResult(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, [form, validate]);

  const hasPhone = form.PhoneService === 'Yes';
  const hasInternet = form.InternetService !== 'No' && form.InternetService !== '';

  return {
    form,
    errors,
    loading,
    result,
    apiError,
    hasPhone,
    hasInternet,
    handleChange,
    handleSubmit,
  };
}
