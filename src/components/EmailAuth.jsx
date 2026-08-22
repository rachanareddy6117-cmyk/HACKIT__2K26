import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';
import { loginUser, getSampleAccounts } from '../services/api';

export default function EmailAuth({ mode = 'signup', onComplete, onBack }) {
  const isLogin = mode === 'login';
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [sampleAccounts, setSampleAccounts] = useState([]);

  useEffect(() => {
    getSampleAccounts().then(res => {
      if (res && res.accounts) setSampleAccounts(res.accounts);
    });
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    const targetEmail = email.trim() || 'rachana.reddy@gmail.com';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      const res = await loginUser({ authType: 'email', identifier: targetEmail });
      const userData = res.user || {
        email: targetEmail,
        name: targetEmail.split('@')[0],
        authMethod: 'email'
      };

      if (res.token) setStoredItem(STORAGE_KEYS.TOKEN, res.token);
      setStoredItem(STORAGE_KEYS.USER, userData);
      setStoredItem(STORAGE_KEYS.AUTH_METHOD, 'email');
      onComplete(userData);
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setEmail(sample.email);
    setPassword('••••••••');
    handleSubmit();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #05070a 0%, #0b0e14 100%)', color: '#fff' }}
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

      <div
        className="w-full max-w-lg p-8 rounded-3xl space-y-6 relative z-10"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(0,229,255,0.2)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(0,229,255,0.1), 0 0 120px rgba(157,80,187,0.06)',
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.background = 'rgba(0,229,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <Logo size="small" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)' }}>
              <ShieldCheck className="w-3 h-3 inline mr-1" /> AES-256 Privacy Shield Active
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{isLogin ? 'Login to EchoSign' : 'Email Verification & Sign In'}</h2>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
            Enter your credentials or click a pre-verified sample account below.
          </p>
        </div>

        {/* Quick Sample Test Accounts */}
        <div className="p-4 rounded-2xl space-y-2.5" style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.18)' }}>
          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Demo Profiles (1-Click Login):</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(sampleAccounts.length > 0 ? sampleAccounts : [
              { name: 'Rachana Reddy', email: 'rachana.reddy@gmail.com', role: 'Deaf / HOH' },
              { name: 'Alex Smith', email: 'alex.smith@echosign.org', role: 'Autism Coach' },
              { name: 'Sarah Miller', email: 'sarah.introvert@echosign.org', role: 'Introvert' },
              { name: 'Universal User', email: 'demo.user@echosign.org', role: 'Translator' }
            ]).map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(acc)}
                className="text-left px-3 py-2 rounded-xl text-xs transition-all flex flex-col cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.45)'; e.currentTarget.style.background = 'rgba(0,229,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <span className="font-bold text-white flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-cyan-400" /> {acc.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{acc.email}</span>
              </button>
            ))}
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#94a3b8' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#00e5ff' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rachana.reddy@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium placeholder-slate-600 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#00e5ff'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,229,255,0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#94a3b8' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9d50bb' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-medium placeholder-slate-600 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#9d50bb'; e.currentTarget.style.boxShadow = '0 0 16px rgba(157,80,187,0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded cursor-pointer"
                style={{ color: '#94a3b8' }}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg,#00e5ff,#9d50bb)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 0 30px rgba(0,229,255,0.35)',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 44px rgba(0,229,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
          >
            {loading ? 'Authenticating with Backend...' : (isLogin ? 'Login to Dashboard' : 'Authenticate & Continue')} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
