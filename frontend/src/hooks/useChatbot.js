import { useState, useRef, useCallback, useEffect } from 'react';
import { sendChatMessage } from '../api/chat';
import { predictChurn } from '../api/predict';
import { explainPrediction } from '../api/chat';

/**
 * Initial empty state — all null means "not yet provided by user".
 * Optional fields get smart defaults applied by the backend when complete.
 */
const EMPTY_DATA = {
  // Required (10) — must come from user
  gender: null, SeniorCitizen: null, Partner: null, Dependents: null,
  tenure: null, PhoneService: null, InternetService: null,
  Contract: null, PaymentMethod: null, MonthlyCharges: null,
  // Optional (9) — auto-defaulted by backend
  TotalCharges: null, MultipleLines: null,
  OnlineSecurity: null, OnlineBackup: null, DeviceProtection: null,
  TechSupport: null, StreamingTV: null, StreamingMovies: null,
  PaperlessBilling: null,
};

const REQUIRED_FIELDS = [
  'gender', 'SeniorCitizen', 'Partner', 'Dependents',
  'tenure', 'PhoneService', 'InternetService',
  'Contract', 'PaymentMethod', 'MonthlyCharges',
];

const WELCOME_MESSAGE = {
  role: 'bot',
  id: 'welcome',
  text: `👋 Hi! I'm your **AI Churn Analyst** — powered by Groq LLM + RandomForest ML.

Tell me about the customer in **natural language** and I'll predict their churn risk.

**Example:**
*"Male customer, 24 months with us, Fiber optic internet, month-to-month contract, pays by Electronic Check, $85 per month. He has a partner but no dependents."*

I'll ask for anything I need. Optional details (streaming, security add-ons, etc.) are handled automatically if you don't mention them.`,
};

export function useChatbot() {
  const [messages,         setMessages]         = useState([WELCOME_MESSAGE]);
  const [inputValue,       setInputValue]       = useState('');
  const [isTyping,         setIsTyping]         = useState(false);
  const [accumulatedData,  setAccumulatedData]  = useState({ ...EMPTY_DATA });
  const [predictionResult, setPredictionResult] = useState(null);
  const [explanation,      setExplanation]      = useState('');
  const [isComplete,       setIsComplete]       = useState(false);
  const messagesEndRef = useRef(null);

  // Count how many required fields are filled (for progress bar)
  const filledCount = REQUIRED_FIELDS.filter(
    f => accumulatedData[f] !== null && accumulatedData[f] !== undefined
  ).length;

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, predictionResult]);

  const addMessage = useCallback((role, text, extra = {}) => {
    setMessages(prev => [
      ...prev,
      { role, text, id: `${Date.now()}-${Math.random()}`, ...extra },
    ]);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setAccumulatedData({ ...EMPTY_DATA });
    setPredictionResult(null);
    setExplanation('');
    setIsComplete(false);
    setInputValue('');
  }, []);

  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isTyping) return;

    setInputValue('');
    addMessage('user', text);
    setIsTyping(true);

    try {
      /* ─── Step 1: LLM extracts data ─── */
      const llmRes = await sendChatMessage(text, accumulatedData);

      if (llmRes.error) {
        addMessage('bot', `⚠️ ${llmRes.error}`);
        setIsTyping(false);
        return;
      }

      const newData = llmRes.data || accumulatedData;
      setAccumulatedData(newData);

      if (!llmRes.complete) {
        /* More info needed — show LLM's question */
        addMessage('bot', llmRes.message || 'Could you provide a bit more detail?');
        setIsTyping(false);
        return;
      }

      /* ─── All required fields collected ─── */
      setIsComplete(true);
      addMessage('bot', llmRes.message || '✅ Got everything! Running prediction now…');

      /* ─── Step 2: Predict ─── */
      let predRes;
      try {
        predRes = await predictChurn(newData);
      } catch (predErr) {
        addMessage('bot', `⚠️ Prediction error: ${predErr.message}`);
        setIsTyping(false);
        return;
      }

      // Use customer_data returned by backend (includes filled defaults)
      const fullCustomerData = predRes.customer_data || newData;
      setPredictionResult({
        prediction:   predRes.prediction,
        probability:  predRes.probability,
        customerData: fullCustomerData,
      });
      setAccumulatedData(fullCustomerData);

      /* ─── Step 3: LLM explanation (non-blocking) ─── */
      try {
        const explRes = await explainPrediction(
          predRes.prediction,
          predRes.probability,
          fullCustomerData,
        );
        setExplanation(explRes.explanation || '');
      } catch (_) {
        /* Explanation is optional — don't block the result */
      }

      setIsTyping(false);

    } catch (err) {
      addMessage('bot', `⚠️ ${err.message || 'Something went wrong. Please try again.'}`);
      setIsTyping(false);
    }
  }, [inputValue, isTyping, accumulatedData, addMessage]);

  return {
    messages, inputValue, setInputValue, isTyping,
    accumulatedData, predictionResult, explanation, isComplete,
    filledCount, requiredTotal: REQUIRED_FIELDS.length,
    messagesEndRef, handleSend, resetChat,
  };
}
