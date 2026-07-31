import React, { useState, useRef } from 'react';
import './App.css';
import Navbar           from './components/Navbar';
import Hero             from './components/Hero';
import ChatView         from './components/ChatView';
import ManualForm       from './components/ManualForm';
import ModelInfoSection from './components/ModelInfoSection';
import AppFooter        from './components/AppFooter';
import { useChatbot }   from './hooks/useChatbot';

/**
 * Views:
 *  'landing' — Hero + Model Info + Footer
 *  'chat'    — Full chat interface
 *  'manual'  — Manual entry form
 */
export default function App() {
  const [view, setView] = useState('landing');
  const chatbot = useChatbot();
  const chatRef = useRef(null);

  const goToChat = () => {
    setView('chat');
    setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden />

      <Navbar
        view={view}
        onNewChat={() => { chatbot.resetChat(); setView('chat'); }}
        onManual={() => setView('manual')}
        onHome={() => setView('landing')}
      />

      <main className="app-main">
        {view === 'landing' && (
          <>
            <Hero onStart={goToChat} onManual={() => setView('manual')} />
            <ModelInfoSection />
            <AppFooter />
          </>
        )}

        {view === 'chat' && (
          <div ref={chatRef} className="chat-page">
            <ChatView
              chatbot={chatbot}
              onManualEntry={() => setView('manual')}
            />
          </div>
        )}

        {view === 'manual' && (
          <div className="manual-page">
            <ManualForm onBack={() => setView('chat')} />
          </div>
        )}
      </main>
    </div>
  );
}
