import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';
import { loginUser, getSampleAccounts } from '../services/api';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  backdropFilter: 'blur(12px)',
};

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
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(180deg,#05070A,#0B0E14)' }}
    >
      <div
        className="w-full max-w-lg p-8 rounded-3xl space-y-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(0,242,254,0.08)',
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,242,254,0.12)', color: '#00F2FE', border: '1px solid rgba(0,242,254,0.3)' }}>
              <ShieldCheck className="w-3 h-3 inline mr-1" /> Privacy Shield Active
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{isLogin ? 'Login to EchoSign' : 'Email Verification & Sign In'}</h2>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
            Enter your credentials or click a pre-verified sample account below.
          </p>
        </div>

        {/* Quick Sample Test Accounts */}
        <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.15)' }}>
          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>⚡ Quick Demo Profiles (1-Click Login):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(sampleAccounts.length > 0 ? sampleAccounts : [
              { name: 'Rachana Reddy', email: 'rachana.reddy@gmail.com', role: 'Deaf/HOH' },
              { name: 'Alex Smith', email: 'alex.smith@echosign.org', role: 'Autism Coach' },
              { name: 'Sarah Miller', email: 'sarah.introvert@echosign.org', role: 'Introvert' },
              { name: 'Universal User', email: 'demo.user@echosign.org', role: 'Translator' }
            ]).map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(acc)}
                className="text-left px-3 py-2 rounded-xl text-xs transition-all flex flex-col"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,242,254,0.4)'; e.currentTarget.style.background = 'rgba(0,242,254,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
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
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#94A3B8' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#00F2FE' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rachana.reddy@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium placeholder-slate-600 focus:outline-none transition-all"
                style={inputStyle}
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
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
              color: '#fff',
              boxShadow: '0 0 28px rgba(0,242,254,0.25)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating with Backend...' : (isLogin ? 'Login to Dashboard' : 'Authenticate & Continue')} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
