import React, { useState } from 'react';
import { Volume2, ShieldAlert, Radio, AlertTriangle } from 'lucide-react';
import { broadcastEmergencyApi } from '../services/api';

const ACTIONS = [
  { id: 'help',     label: '🆘 I NEED HELP',     speech: 'I need immediate help!',                   color: '#ef4444' },
  { id: 'doctor',   label: '🏥 I NEED A DOCTOR',  speech: 'I need medical assistance from a doctor.', color: '#f97316' },
  { id: 'water',    label: '💧 I NEED WATER',      speech: 'Please I need drinking water.',            color: '#00e5ff' },
  { id: 'security', label: '🚨 CALL SECURITY',     speech: 'Call security officers right away.',       color: '#f59e0b' },
  { id: 'lost',     label: '📍 I AM LOST',          speech: 'I am lost and need directions.',          color: '#9d50bb' },
  { id: 'pain',     label: '❤️ I AM IN PAIN',       speech: 'I am experiencing serious pain.',         color: '#ec4899' },
];

export default function Emergency() {
  const [alert, setAlert] = useState(null);

  const trigger = (action) => {
    setAlert(action);
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(action.speech));
    broadcastEmergencyApi({
      alertId: action.id,
      label: action.label,
      speech: action.speech,
      location: 'User Geolocation Coordinates: Active'
    }).catch(() => {});
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-1 text-rose-500">
            <ShieldAlert className="w-4 h-4" />
            Emergency Mode Active
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Accessible <span className="grad-text">Emergency Dispatch</span>
          </h1>
        </div>
        <span
          className="text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          Live SOS Relay
        </span>
      </div>

      {/* 2x3 Grid of colorful emergency tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACTIONS.map(a => (
          <button
            key={a.id}
            onClick={() => trigger(a)}
            className="p-7 rounded-3xl font-black text-base text-white text-center min-h-[140px] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${a.color}40`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 8px 24px ${a.color}15`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${a.color}20`;
              e.currentTarget.style.boxShadow  = `0 0 36px ${a.color}35`;
              e.currentTarget.style.transform  = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.boxShadow  = `0 8px 24px ${a.color}15`;
              e.currentTarget.style.transform  = 'none';
            }}
          >
            <span className="text-lg group-hover:scale-105 transition-transform">{a.label}</span>
            <span className="text-[11px] font-medium text-slate-400">Click to broadcast immediately</span>
          </button>
        ))}
      </div>

      {/* Active Broadcast Banner */}
      {alert && (
        <div
          className="p-7 rounded-3xl text-center space-y-4 animate-fade-in-up"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '2px solid #ef4444',
            boxShadow: '0 0 50px rgba(239,68,68,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(239,68,68,0.2)', border: '2px solid rgba(239,68,68,0.5)' }}
          >
            <Volume2 className="w-7 h-7 animate-bounce text-rose-400" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-rose-400">
              Broadcasting Alert to Responders
            </div>
            <div className="text-3xl font-black text-white">{alert.label}</div>
          </div>

          <div
            className="text-xs font-semibold max-w-md mx-auto px-4 py-3 rounded-xl text-slate-200"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            "{alert.speech}"
          </div>

          <button
            onClick={() => setAlert(null)}
            className="px-8 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            Dismiss Alert
          </button>
        </div>
      )}
    </div>
  );
}
