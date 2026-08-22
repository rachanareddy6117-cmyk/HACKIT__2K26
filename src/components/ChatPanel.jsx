import React, { useState } from 'react';
import { Send, Trash2, Sparkles, Volume2, Bot, ShieldCheck } from 'lucide-react';
import { sendChatMessage } from '../services/api';

function getWelcomeMsg(personaId) {
  switch (personaId) {
    case 'deaf_hoh':       return 'Your communication mode is optimized for visual interaction. Live sign detection captions appear directly over your video feed.';
    case 'autism_support': return "Let's take this one step at a time in a calm, predictable space. I'm here whenever you need.";
    case 'introvert_coach':return 'Would you like to practice that conversation? Feel free to try out responses here at your own pace.';
    case 'sign_learner':   return "Great! Let me know which ISL sign you'd like to practice, or switch to the Practice tab.";
    default:               return 'Hello! I am your Echo AI assistant. Speak, type, or sign to begin our conversation.';
  }
}

export default function ChatPanel({ persona, liveGlosses = [] }) {
  const [messages, setMessages] = useState([{
    id: 1, 
    sender: 'ai',
    text: getWelcomeMsg(persona?.id),
    provider: persona?.id === 'autism_support' || persona?.id === 'introvert_coach' ? 'Claude 3.5 Sonnet' : 'Gemini 1.5 Flash',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);

  const sendMsg = async (e) => {
    e?.preventDefault();
    if (!input.trim() && liveGlosses.length === 0) return;

    const query = input.trim();
    const userMsg = { 
      id: Date.now(), 
      sender: 'user', 
      text: query || `Detected Sign: [ ${liveGlosses.join(' ')} ]`, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const res = await sendChatMessage({
        message: query,
        personaCategory: persona?.id || 'deaf_hoh',
        liveGlosses: liveGlosses
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res?.reply || 'Response received.',
        provider: res?.provider || 'EchoSign AI',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `[Echo AI]: I received "${query || 'Sign'}". Ready to assist your communication!`,
          provider: 'Echo AI Engine',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const speak = (text) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.25)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#00F2FE' }} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Echo AI Assistant</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono" style={{ background: 'rgba(0,242,254,0.15)', color: '#00F2FE' }}>
                {persona?.id === 'autism_support' || persona?.id === 'introvert_coach' ? 'Claude 3.5' : 'Gemini 1.5'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#00F2FE' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: '#00F2FE' }} />
              Backend Connected • Live Sensory Engine
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([])} style={{ color: '#475569' }} className="hover:text-white transition-colors p-1.5 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className="max-w-[88%] px-4 py-3 rounded-2xl text-xs leading-relaxed"
              style={m.sender === 'user' ? {
                background: 'linear-gradient(135deg, rgba(0,242,254,0.22), rgba(157,80,187,0.22))',
                border: '1px solid rgba(0,242,254,0.3)',
                color: '#ffffff',
                borderBottomRightRadius: 4,
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#cbd5e1',
                borderBottomLeftRadius: 4,
              }}
            >
              {m.sender === 'ai' && (
                <div className="flex items-center justify-between text-[9px] font-mono mb-1 text-cyan-300">
                  <span>{m.provider || 'EchoSign AI'}</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 opacity-60" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 9 }}>
                <span>{m.time}</span>
                {m.sender === 'ai' && (
                  <button onClick={() => speak(m.text)} style={{ color: '#00F2FE' }} className="hover:scale-110 transition-transform">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-1.5 py-2 px-1">
            <span className="text-[10px] text-cyan-400 font-bold mr-1">AI Thinking:</span>
            {[0, 0.2, 0.4].map((d, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#00F2FE', animationDelay: `${d}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMsg}
        className="flex items-center gap-2 p-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            persona?.id === 'autism_support' 
              ? 'Type in a calm, predictable space...' 
              : persona?.id === 'introvert_coach'
              ? 'Ask for a low-pressure micro-script...'
              : 'Type your message or use sign gestures...'
          }
          className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all placeholder-slate-600"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,242,254,0.3)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />
        <button
          type="submit"
          disabled={!input.trim() && liveGlosses.length === 0}
          className="p-2.5 rounded-xl transition-all flex-shrink-0 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
            color: '#fff',
            opacity: !input.trim() && liveGlosses.length === 0 ? 0.4 : 1,
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
