import React, { useState } from 'react';
import { Volume2, ShieldAlert } from 'lucide-react';

const ACTIONS = [
  { id: 'help',     label: '🆘 I NEED HELP',     speech: 'I need immediate help!',                   accent: '#ef4444' },
  { id: 'doctor',   label: '🏥 I NEED A DOCTOR',  speech: 'I need medical assistance from a doctor.', accent: '#f97316' },
  { id: 'water',    label: '💧 I NEED WATER',      speech: 'Please I need drinking water.',            accent: '#00F2FE' },
  { id: 'security', label: '🚨 CALL SECURITY',     speech: 'Call security officers right away.',       accent: '#f59e0b' },
  { id: 'lost',     label: '📍 I AM LOST',          speech: 'I am lost and need directions.',          accent: '#9D50BB' },
  { id: 'pain',     label: '❤️ I AM IN PAIN',       speech: 'I am experiencing serious pain.',         accent: '#ef4444' },
];

export default function Emergency() {
  const [alert, setAlert] = useState(null);

  const trigger = (action) => {
    setAlert(action);
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(action.speech));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#ef4444' }}>
            <ShieldAlert className="w-4 h-4" />
            Emergency Mode
          </div>
          <h1 className="text-2xl font-black text-white">Accessible Emergency Alerts</h1>
        </div>
        <span
          className="text-[10px] font-bold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
        >
          Prototype Mode
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIONS.map(a => (
          <button
            key={a.id}
            onClick={() => trigger(a)}
            className="p-6 rounded-3xl font-black text-base text-white text-center min-h-[130px] flex items-center justify-center transition-all focus:outline-none"
            style={{
              background: `${a.accent}10`,
              border: `1px solid ${a.accent}35`,
              backdropFilter: 'blur(16px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${a.accent}20`;
              e.currentTarget.style.boxShadow  = `0 0 36px ${a.accent}30`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `${a.accent}10`;
              e.currentTarget.style.boxShadow  = 'none';
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {alert && (
        <div
          className="p-6 rounded-3xl text-center space-y-4 animate-fade-in-up"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.3)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <Volume2 className="w-6 h-6 animate-pulse" style={{ color: '#ef4444' }} />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#ef4444' }}>
              Broadcasting Alert
            </div>
            <div className="text-3xl font-black text-white">{alert.label}</div>
          </div>

          <div
            className="text-xs font-medium max-w-sm mx-auto px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8' }}
          >
            "{alert.speech}"
          </div>

          <button
            onClick={() => setAlert(null)}
            className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          >
            Dismiss Alert
          </button>
        </div>
      )}
    </div>
  );
}
