import React, { useState } from 'react';
import { ArrowRight, Volume2, Type, Mic, Eye, Globe, Sparkles } from 'lucide-react';
import { translateApi } from '../services/api';
import LiveSignInput from './LiveSignInput';

const TABS = [
  { id: 'TEXT',   label: 'TEXT',   icon: Type },
  { id: 'SPEECH', label: 'SPEECH', icon: Mic },
  { id: 'SIGN',   label: 'SIGN',   icon: Eye },
];

export default function Translator() {
  const [mode,   setMode]   = useState('TEXT');
  const [input,  setInput]  = useState('Hello');
  const [result, setResult] = useState({
    output: 'HELLO 👋',
    speech: 'Hello! Nice to meet you.'
  });
  const [loading, setLoading] = useState(false);

  const translate = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await translateApi(input.trim(), mode);
      setResult(res);
    } catch {
      setResult({
        output: `${input.toUpperCase()} 🤟`,
        speech: input,
      });
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Everyday <span className="grad-text">Translation Engine</span>
        </h1>
        <p className="text-xs mt-1 text-slate-400">
          Translate seamlessly between speech audio, text phrases, and sign language glosses with real-time speech synthesis.
        </p>
      </div>

      {/* Mode tabs */}
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-2xl max-w-xs"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            style={mode === id ? {
              background: 'linear-gradient(135deg,rgba(0,229,255,0.18),rgba(157,80,187,0.18))',
              color: '#00e5ff',
              border: '1px solid rgba(0,229,255,0.35)',
              boxShadow: '0 0 16px rgba(0,229,255,0.15)',
            } : { color: '#94a3b8', border: '1px solid transparent' }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div
          className="p-7 rounded-3xl space-y-4 flex flex-col justify-between"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Input ({mode})
              </label>
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Backend Engine Active
              </span>
            </div>

            {mode === 'SIGN' ? (
              <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden border border-white/10 relative shadow-inner">
                <LiveSignInput onGestureStabilized={(gesture) => {
                  setInput(prev => {
                    const current = prev.trim();
                    if (current === 'Hello' || current === '') return gesture;
                    return current + ' ' + gesture;
                  });
                }} />
              </div>
            ) : (
              <textarea
                rows={5}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. Hello, Yes, Stop, Water, Help, Doctor, Thank You, I Love You..."
                className="w-full p-4 rounded-2xl text-sm font-medium resize-none focus:outline-none transition-all placeholder-slate-600"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#fff',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#00e5ff'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,229,255,0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            )}

            <div className="flex flex-wrap gap-1.5">
              {['Hello', 'Water', 'Thank You', 'Help', 'Doctor', 'Yes', 'I Love You'].map(quick => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => { setInput(quick); }}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-300 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors cursor-pointer border border-white/5"
                >
                  + {quick}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={translate}
            disabled={!input.trim() || loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg,#00e5ff,#9d50bb)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 0 30px rgba(0,229,255,0.35)',
              opacity: !input.trim() || loading ? 0.45 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 44px rgba(0,229,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
          >
            {loading ? 'Translating with Backend...' : 'Translate to Sign & Audio'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Output Card */}
        <div
          className="p-7 rounded-3xl flex flex-col justify-between space-y-4"
          style={{
            background: '#05070a',
            border: '1px solid rgba(0,229,255,0.25)',
            boxShadow: '0 0 40px rgba(0,229,255,0.1), 0 0 80px rgba(157,80,187,0.06)',
          }}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-5 text-slate-400">
              <span>Sign Translation Output</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            {result ? (
              <div className="space-y-4">
                <div className="text-4xl md:text-5xl font-black tracking-tight text-cyan-400 drop-shadow-md">{result.output}</div>
                <div
                  className="text-xs p-3.5 rounded-xl font-mono leading-relaxed text-slate-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Audio Speech: "{result.speech}"
                </div>
              </div>
            ) : (
              <div className="text-sm italic py-12 text-center text-slate-600">
                Translation output and speech audio will appear here.
              </div>
            )}
          </div>

          {result && (
            <button
              onClick={() => speak(result.speech)}
              className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(157,80,187,0.15))',
                border: '1px solid rgba(0,229,255,0.4)',
                color: '#00e5ff',
                boxShadow: '0 0 20px rgba(0,229,255,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(157,80,187,0.15))'; }}
            >
              <Volume2 className="w-4 h-4" />
              Speak Output Audio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
