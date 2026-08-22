import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  backdropFilter: 'blur(12px)',
};

export default function EmailAuth({ mode = 'signup', onComplete, onBack }) {
  const isLogin = mode === 'login';
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Email address is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError('Please enter a valid email address.');
    if (!password) return setError('Password is required.');

    const userData = { email: email.trim(), authMethod: 'email', name: email.split('@')[0] };
    setStoredItem(STORAGE_KEYS.USER, userData);
    setStoredItem(STORAGE_KEYS.AUTH_METHOD, 'email');
    onComplete(userData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: 'linear-gradient(180deg,#05070A,#0B0E14)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-3xl space-y-7"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(0,242,254,0.06)',
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00F2FE'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Logo size="small" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">{isLogin ? 'Login to EchoSign' : 'Email Verification'}</h2>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
            {isLogin ? 'Welcome back. Enter your account details to continue.' : 'Enter your credentials to proceed.'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="p-3 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#94A3B8' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#00F2FE' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium placeholder-slate-600 focus:outline-none transition-all"
                style={{
                  ...inputStyle,
                  boxShadow: 'none',
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,242,254,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,242,254,0.08)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#94A3B8' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9D50BB' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-medium placeholder-slate-600 focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(157,80,187,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(157,80,187,0.08)'; }}
                onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded"
                style={{ color: '#94A3B8' }}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
              color: '#fff',
              boxShadow: '0 0 28px rgba(0,242,254,0.25)',
            }}
          >
            {isLogin ? 'Login' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>

          {!isLogin && (
            <button
              type="button"
              onClick={() => onBack && onBack()}
              className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }}
            >
              Back to methods
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
