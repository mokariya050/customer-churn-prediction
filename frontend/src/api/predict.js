/**
 * predict.js — API helper for the /predict endpoint
 */

async function safeJson(res) {
  const text = await res.text();
  if (!text || !text.trim()) {
    return { error: `Server returned an empty response (HTTP ${res.status}).` };
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    const snippet = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    return { error: `Server returned non-JSON: "${snippet}"` };
  }
}

/**
 * @param {Object} formData - customer data (backend applies smart defaults)
 * @returns {Promise<{prediction, probability, customer_data}>}
 */
export async function predictChurn(formData) {
  let res;
  try {
    res = await fetch('/predict', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(formData),
    });
  } catch (networkErr) {
    throw new Error('Cannot connect to server. Is the Flask backend running on port 5000?');
  }

  const data = await safeJson(res);
  if (data.error) throw new Error(data.error);
  return data;
}
