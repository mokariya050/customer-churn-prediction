import React from 'react';

/* Inline markdown: **bold** and *italic* */
function parseInline(text) {
  const parts = [];
  const rx = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0, m;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) parts.push(<strong key={m.index}>{m[1]}</strong>);
    else                    parts.push(<em key={m.index}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderText(text) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {parseInline(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({ role, text }) {
  const isBot = role === 'bot';

  return (
    <div className={`cv-msg-row ${role}`}>
      {/* Avatar */}
      <div className={`cv-avatar ${isBot ? 'bot-avatar' : 'user-avatar'}`}>
        {isBot ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="white"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                  fill="currentColor"/>
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="cv-msg-content">
        <div className="cv-msg-header">
          <span className="cv-msg-name">{isBot ? 'AI Analyst' : 'You'}</span>
          <span className="cv-msg-time">{formatTime()}</span>
        </div>
        <div className="cv-msg-body">
          {renderText(text)}
        </div>
      </div>
    </div>
  );
}
