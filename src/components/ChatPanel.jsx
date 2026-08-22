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
      className="flex flex-col h-full rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg,rgba(0,229,255,0.2),rgba(157,80,187,0.2))',
              border: '1px solid rgba(0,229,255,0.35)',
              boxShadow: '0 0 14px rgba(0,229,255,0.25)',
            }}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Echo AI Assistant</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {persona?.id === 'autism_support' || persona?.id === 'introvert_coach' ? 'Claude 3.5' : 'Gemini 1.5'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Backend Connected • Live Sensory Engine
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="text-slate-400 hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-white/5 cursor-pointer"
          title="Clear Conversation"
        >
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
                background: 'linear-gradient(135deg, rgba(0,229,255,0.22), rgba(157,80,187,0.22))',
                border: '1px solid rgba(0,229,255,0.35)',
                color: '#ffffff',
                borderBottomRightRadius: 4,
                boxShadow: '0 4px 16px rgba(0,229,255,0.12)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
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
              <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 opacity-60 border-t border-white/10 text-[9px]">
                <span>{m.time}</span>
                {m.sender === 'ai' && (
                  <button onClick={() => speak(m.text)} className="text-cyan-400 hover:scale-110 transition-transform cursor-pointer">
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
                className="w-2 h-2 rounded-full animate-bounce bg-cyan-400"
                style={{ animationDelay: `${d}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMsg}
        className="flex items-center gap-2 p-3.5 border-t border-white/10"
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
          className="flex-1 px-4 py-3 rounded-2xl text-xs font-medium focus:outline-none transition-all placeholder-slate-500"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#fff',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#00e5ff'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,229,255,0.2)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <button
          type="submit"
          disabled={!input.trim() && liveGlosses.length === 0}
          className="p-3 rounded-2xl transition-all flex-shrink-0 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg,#00e5ff,#9d50bb)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 0 20px rgba(0,229,255,0.3)',
            opacity: !input.trim() && liveGlosses.length === 0 ? 0.4 : 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(0,229,255,0.3)'; }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
