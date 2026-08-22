import React, { useState } from 'react';
import { DEMO_TRANSLATIONS } from '../utils/gestureData';
import { ArrowRight, Volume2, Type, Mic, Eye, Globe, Sparkles } from 'lucide-react';
import { translateTextOrSign } from '../services/api';

const TABS = [
  { id: 'text',   label: 'TEXT',   icon: Type },
  { id: 'speech', label: 'SPEECH', icon: Mic },
  { id: 'sign',   label: 'SIGN',   icon: Eye },
];

export default function Translator() {
  const [mode,   setMode]   = useState('text');
  const [input,  setInput]  = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const translate = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await translateTextOrSign({
        text: input.trim(),
        sourceMode: mode,
        targetMode: 'sign'
      });

      if (res && res.result) {
        setResult(res.result);
      } else {
        const key = input.trim().toLowerCase();
        const fallbackRes = DEMO_TRANSLATIONS[key] || {
          sign: 'OPEN_HAND',
          output: `${input.toUpperCase()} 🤟`,
          speech: input,
        };
        setResult(fallbackRes);
      }
    } catch {
      setResult({
        sign: 'OPEN_HAND',
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Everyday Translation Engine</h1>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
          Translate seamlessly between speech audio, text phrases and sign language glosses with full speech synthesis.
        </p>
      </div>

      {/* Mode tabs */}
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-2xl max-w-xs"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            style={mode === id ? {
              background: 'linear-gradient(135deg,rgba(0,242,254,0.15),rgba(157,80,187,0.15))',
              color: '#00F2FE',
              border: '1px solid rgba(0,242,254,0.25)',
            } : { color: '#94A3B8' }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input */}
        <div
          className="p-6 rounded-3xl space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-black uppercase tracking-widest" style={{ color: '#94A3B8' }}>
              Input ({mode.toUpperCase()})
            </label>
            <span className="text-[10px] text-cyan-400 font-mono">Backend Engine Active</span>
          </div>

          <textarea
            rows={5}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. Hello, Yes, Stop, Water, Help, Doctor, Thank You..."
            className="w-full p-4 rounded-2xl text-sm font-medium resize-none focus:outline-none transition-all placeholder-slate-600"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,242,254,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,242,254,0.06)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
          />

          <div className="flex flex-wrap gap-1.5">
            {['Hello', 'Water', 'Thank You', 'Help', 'Doctor', 'Yes'].map(quick => (
              <button
                key={quick}
                type="button"
                onClick={() => { setInput(quick); }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
              >
                + {quick}
              </button>
            ))}
          </div>

          <button
            onClick={translate}
            disabled={!input.trim() || loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
              color: '#fff',
              boxShadow: '0 0 24px rgba(0,242,254,0.2)',
              opacity: !input.trim() || loading ? 0.45 : 1,
            }}
          >
            {loading ? 'Translating with Backend...' : 'Translate to Sign & Audio'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Output */}
        <div
          className="p-6 rounded-3xl flex flex-col justify-between space-y-4"
          style={{
            background: '#05070A',
            border: '1px solid rgba(0,242,254,0.2)',
            boxShadow: '0 0 40px rgba(0,242,254,0.08)',
          }}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>
              <span>Sign Translation Output</span>
              <Globe className="w-4 h-4" style={{ color: '#00F2FE' }} />
            </div>
            {result ? (
              <div className="space-y-4">
                <div className="text-4xl font-black tracking-tight" style={{ color: '#00F2FE' }}>{result.output}</div>
                <div
                  className="text-xs p-3 rounded-xl font-mono leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8' }}
                >
                  Audio Speech: "{result.speech}"
                </div>
              </div>
            ) : (
              <div className="text-sm italic py-10 text-center" style={{ color: '#475569' }}>
                Translation output and speech audio will appear here.
              </div>
            )}
          </div>
          {result && (
            <button
              onClick={() => speak(result.speech)}
              className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{ background: 'rgba(0,242,254,0.12)', border: '1px solid rgba(0,242,254,0.3)', color: '#00F2FE' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.12)'; }}
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
