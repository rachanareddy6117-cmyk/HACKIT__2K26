import React from 'react';
import { Mail, Eye, Mic, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';

const METHODS = [
  {
    id: 'email',
    icon: Mail,
    title: 'Email & Password',
    desc: 'Instant verification with secure credentials and 1-click profiles',
    color: '#00e5ff',
  },
  {
    id: 'face',
    icon: Eye,
    title: 'Biometric Face ID',
    desc: 'Touchless visual verification using camera landmark mesh',
    color: '#9d50bb',
  },
  {
    id: 'voice',
    icon: Mic,
    title: 'Voice Passphrase',
    desc: 'Acoustic audio verification using voice tone recognition',
    color: '#f59e0b',
  },
];

export default function Auth({ mode = 'login', onSelectMethod, onBack }) {
  const isLogin = mode === 'login';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #05070a 0%, #0b0e14 100%)',
        color: '#fff',
      }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '-140px', left: '-140px',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-80px',
        width: 440, height: 440, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(157,80,187,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      {/* Cyber Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}/>

      <div className="w-full max-w-3xl space-y-10 relative z-10">

        {/* Back + Logo */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold transition-all px-3 py-1.5 rounded-xl cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.background = 'rgba(0,229,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
          <Logo size="small" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.25)' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            AES-256 Encrypted Identity Verification
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {isLogin ? 'Welcome Back to ' : 'Create Your '}
            <span className="grad-text">EchoSign</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 max-w-md mx-auto">
            Choose your preferred accessible verification method to continue.
          </p>
        </div>

        {/* Verification Method Cards (Matching Homepage Quad-card style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {METHODS.map(({ id, icon: Icon, title, desc, color }, i) => (
            <button
              key={id}
              onClick={() => onSelectMethod(id)}
              className={`p-7 rounded-3xl text-left flex flex-col justify-between gap-6 transition-all duration-300 group cursor-pointer anim-fadeup delay-${i+1}`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${color}60`;
                e.currentTarget.style.boxShadow = `0 0 32px ${color}22`;
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  width: 50, height: 50,
                  background: `${color}18`,
                  border: `1px solid ${color}40`,
                  color: color,
                }}
              >
                <Icon size={24} color={color} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
              <div
                className="w-full py-2 rounded-xl text-center text-xs font-bold transition-all"
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  color: color,
                }}
              >
                Select {title.split(' ')[0]} →
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
