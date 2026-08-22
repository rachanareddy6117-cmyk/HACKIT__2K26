import React from 'react';
import { Mail, Eye, Mic, ArrowLeft } from 'lucide-react';
import Logo from './Logo';

const METHODS = [
  {
    id: 'email',
    icon: <Mail className="w-6 h-6" />,
    title: 'Email',
    desc: 'Sign in securely with your email',
    accent: '#00F2FE',
  },
  {
    id: 'face',
    icon: <Eye className="w-6 h-6" />,
    title: 'Face',
    desc: 'Quick facial verification',
    accent: '#9D50BB',
  },
  {
    id: 'voice',
    icon: <Mic className="w-6 h-6" />,
    title: 'Voice',
    desc: 'Verify using your voice',
    accent: '#00F2FE',
  },
];

export default function Auth({ mode = 'login', onSelectMethod, onBack }) {
  const isLogin = mode === 'login';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'linear-gradient(180deg, #05070A 0%, #0B0E14 100%)' }}
    >
      <div className="w-full max-w-2xl space-y-10">

        {/* Back + Logo */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00F2FE'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <Logo size="small" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            Choose how you want to verify your identity.
          </p>
        </div>

        {/* Verification Method Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMethod(m.id)}
              className="p-7 rounded-3xl text-left flex flex-col gap-5 transition-all duration-200 group"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${m.accent}40`;
                e.currentTarget.style.boxShadow = `0 0 32px ${m.accent}15`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  background: `${m.accent}14`,
                  border: `1px solid ${m.accent}30`,
                  color: m.accent,
                }}
              >
                {m.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{m.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
