/**
 * chat.js — API helpers for /chat and /explain endpoints
 * Uses safeJson() to handle empty / non-JSON responses gracefully.
 */

/**
 * Safely parse a fetch Response as JSON.
 * Returns a plain error object if the body is empty or non-JSON.
 */
async function safeJson(res) {
  const text = await res.text();          // always succeeds
  if (!text || !text.trim()) {
    // Empty body — server crashed before writing a response
    return { error: `Server returned an empty response (HTTP ${res.status}). Is the Flask backend running?` };
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    // Body is HTML (Flask debug page, etc.) — extract first 200 chars for diagnosis
    const snippet = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    return { error: `Server returned non-JSON response: "${snippet}"` };
  }
}

/**
 * Send a user message + accumulated data to LLM via Flask /chat.
 */
export async function sendChatMessage(message, accumulated_data) {
  let res;
  try {
    res = await fetch('/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, accumulated_data }),
    });
  } catch (networkErr) {
    throw new Error('Cannot connect to server. Is the Flask backend running on port 5000?');
  }

  const json = await safeJson(res);
  if (json.error) throw new Error(json.error);
  return json;
}

/**
 * Ask LLM for a business explanation via Flask /explain.
 */
export async function explainPrediction(prediction, probability, customer_data) {
  let res;
  try {
    res = await fetch('/explain', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prediction, probability, customer_data }),
    });
  } catch (networkErr) {
    throw new Error('Cannot connect to server for explanation.');
  }

  const json = await safeJson(res);
  if (json.error) throw new Error(json.error);
  return json;
}
