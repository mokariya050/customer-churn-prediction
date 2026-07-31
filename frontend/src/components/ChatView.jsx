import React, { useRef, useEffect, useCallback } from 'react';
import ChatMessage   from './ChatMessage';
import ResultCard    from './ResultCard';
import CustomerPanel from './CustomerPanel';
import './ChatView.css';

/* Typing indicator */
function TypingIndicator() {
  return (
    <div className="cv-msg-row bot">
      <div className="cv-avatar bot-avatar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="white"/>
        </svg>
      </div>
      <div className="cv-typing-bubble">
        <span/><span/><span/>
      </div>
    </div>
  );
}

export default function ChatView({ chatbot, onManualEntry }) {
  const {
    messages, inputValue, setInputValue, isTyping,
    predictionResult, explanation,
    filledCount, requiredTotal,
    messagesEndRef, handleSend, resetChat,
  } = chatbot;

  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  /* Auto-resize textarea */
  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  useEffect(() => { autoResize(); }, [inputValue, autoResize]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Progress bar for required fields */
  const showProgress = filledCount > 0 && filledCount < requiredTotal;
  const pct = Math.round((filledCount / requiredTotal) * 100);

  return (
    <div className="chatview">

      {/* Messages scroll area */}
      <div className="cv-messages">
        <div className="cv-messages-inner">

          {messages.map(msg => (
            <ChatMessage key={msg.id} role={msg.role} text={msg.text} />
          ))}

          {isTyping && <TypingIndicator />}

          {/* Prediction result */}
          {predictionResult && !isTyping && (
            <div className="cv-result-wrap animate-scale-in">
              <ResultCard
                prediction={predictionResult.prediction}
                probability={predictionResult.probability}
                explanation={explanation}
              />
              <CustomerPanel data={predictionResult.customerData} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed bottom input bar */}
      <div className="cv-input-bar">
        <div className="cv-input-container">

          {/* Progress */}
          {showProgress && (
            <div className="cv-progress">
              <div className="cv-progress-bar">
                <div className="cv-progress-fill" style={{ width: pct + '%' }} />
              </div>
              <span className="cv-progress-label">{filledCount}/{requiredTotal} required fields</span>
            </div>
          )}

          <div className="cv-input-wrap">
            <textarea
              ref={inputRef}
              className="cv-input"
              placeholder='Describe your customer... e.g. "Male, 24 months, Fiber optic internet, month-to-month, pays with electronic check, $85/month"'
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              aria-label="Chat input"
            />
            <button
              className="cv-send-btn"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send"
            >
              {isTyping ? (
                <div className="cv-send-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M7 11L12 6L17 11M12 6V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          <div className="cv-input-footer">
            <button className="cv-action" onClick={resetChat}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Chat
            </button>
            <button className="cv-action" onClick={onManualEntry}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6M9 16h6M9 8h3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              </svg>
              Manual Entry
            </button>
            <span className="cv-input-hint">Enter to send · Shift+Enter for new line</span>
          </div>

        </div>
      </div>
    </div>
  );
}
