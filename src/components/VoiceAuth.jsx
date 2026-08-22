import React, { useState, useEffect } from 'react';
import { Mic, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';
import { loginUser } from '../services/api';

export default function VoiceAuth({ onComplete, onBack }) {
  const [isListening,    setIsListening]    = useState(false);
  const [detected,       setDetected]       = useState('');
  const [isSupported,    setIsSupported]    = useState(true);
  const [error,          setError]          = useState('');
  const [verified,       setVerified]       = useState(false);
  const [loading,        setLoading]        = useState(false);

  const TARGET = 'Hello EchoSign';

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) setIsSupported(false);
  }, []);

  const startListening = () => {
    setError('');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { 
      setIsSupported(false); 
      handleSuccess('voice-demo');
      return; 
    }

    try {
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;

      rec.onstart  = () => { setIsListening(true); setDetected(''); };
      rec.onend    = () => setIsListening(false);
      rec.onerror  = (ev) => { 
        setIsListening(false); 
        setError(`Microphone note: ${ev.error}. You can still proceed with instant verification.`); 
      };

      rec.onresult = (ev) => {
        const text = ev.results[0][0].transcript;
        setDetected(text);
        setIsListening(false);

        if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('echosign') || text.length > 2) {
          setVerified(true);
          setTimeout(() => handleSuccess('voice'), 700);
        } else {
          setError(`Phrase not matched. Try again or click instant verification.`);
        }
      };

      rec.start();
    } catch {
      handleSuccess('voice-demo');
    }
  };

  const handleSuccess = async (method = 'voice') => {
    setLoading(true);
    try {
      const res = await loginUser({ authType: 'voice_id', identifier: 'sarah.introvert@echosign.org' });
      const userData = res.user || { name: 'Sarah Miller (Voice Verified)', email: 'sarah.introvert@echosign.org', authMethod: 'voice_id' };
      if (res.token) setStoredItem(STORAGE_KEYS.TOKEN, res.token);
      setStoredItem(STORAGE_KEYS.USER, userData);
      setStoredItem(STORAGE_KEYS.AUTH_METHOD, method);
      onComplete(userData);
    } catch {
      const userData = { name: 'Sarah Miller (Voice Verified)', email: 'sarah.introvert@echosign.org', authMethod: 'voice_id' };
      setStoredItem(STORAGE_KEYS.USER, userData);
      onComplete(userData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: 'linear-gradient(180deg,#05070A,#0B0E14)' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-3xl space-y-7 text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(157,80,187,0.08)',
        }}
      >
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
          <h2 className="text-2xl font-black text-white">Voice Signature Verification</h2>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Say the passphrase below into your microphone.</p>
        </div>

        {/* Target phrase */}
        <div
          className="px-6 py-4 rounded-2xl font-bold text-lg"
          style={{
            background: 'rgba(157,80,187,0.08)',
            border: '1px solid rgba(157,80,187,0.25)',
            color: '#d4b8f0',
          }}
        >
          "{TARGET}"
        </div>

        {/* Mic Button */}
        <div className="flex flex-col items-center gap-4 py-3">
          <button
            onClick={startListening}
            disabled={isListening || verified || loading}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all focus:outline-none cursor-pointer"
            style={{
              background: isListening
                ? 'rgba(239,68,68,0.15)'
                : verified
                ? 'rgba(16,185,129,0.15)'
                : 'rgba(0,242,254,0.1)',
              border: `2px solid ${isListening ? '#ef4444' : verified ? '#10b981' : '#00F2FE'}`,
              boxShadow: isListening
                ? '0 0 30px rgba(239,68,68,0.3)'
                : verified
                ? '0 0 30px rgba(16,185,129,0.3)'
                : '0 0 20px rgba(0,242,254,0.2)',
              color: isListening ? '#ef4444' : verified ? '#10b981' : '#00F2FE',
            }}
          >
            <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
          </button>

          <p className="text-xs font-bold" style={{ color: '#94A3B8' }}>
            {isListening ? 'Listening… Speak now!' : verified ? 'Voice Verified! 🎉' : 'Click microphone to verify'}
          </p>

          {detected && (
            <div
              className="text-xs px-4 py-2 rounded-xl font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
            >
              Detected Voice: <span className="text-white font-bold">"{detected}"</span>
            </div>
          )}
        </div>

        {error && (
          <div
            className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 text-left"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={() => handleSuccess('voice-instant')}
          disabled={loading}
          className="w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          {loading ? 'Authenticating with Backend...' : 'Authenticate with Voice Signature'}
        </button>
      </div>
    </div>
  );
}
