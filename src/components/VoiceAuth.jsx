import React, { useState, useEffect } from 'react';
import { Mic, ArrowLeft, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';

export default function VoiceAuth({ onComplete, onBack }) {
  const [isListening,    setIsListening]    = useState(false);
  const [detected,       setDetected]       = useState('');
  const [isSupported,    setIsSupported]    = useState(true);
  const [error,          setError]          = useState('');
  const [verified,       setVerified]       = useState(false);

  const TARGET = 'Hello EchoSign';

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) setIsSupported(false);
  }, []);

  const startListening = () => {
    setError('');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }

    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onstart  = () => { setIsListening(true); setDetected(''); };
    rec.onend    = () => setIsListening(false);
    rec.onerror  = (ev) => { setIsListening(false); setError(`Microphone error: ${ev.error}`); };

    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      setDetected(text);
      setIsListening(false);

      if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('echosign')) {
        setVerified(true);
        setTimeout(() => handleSuccess('voice'), 900);
      } else {
        setError(`Phrase not matched. Try again.`);
      }
    };

    rec.start();
  };

  const handleSuccess = (method = 'voice') => {
    const userData = { name: 'Voice Verified User', authMethod: method, timestamp: new Date().toISOString() };
    setStoredItem(STORAGE_KEYS.USER, userData);
    setStoredItem(STORAGE_KEYS.AUTH_METHOD, method);
    onComplete(userData);
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
            className="inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00F2FE'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Logo size="small" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">Voice Verification</h2>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Say the phrase below into your microphone.</p>
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
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={startListening}
            disabled={isListening || verified}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all focus:outline-none"
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
            {isListening ? 'Listening… Speak now!' : verified ? 'Voice Verified! 🎉' : 'Click mic to record'}
          </p>

          {detected && (
            <div
              className="text-xs px-4 py-2 rounded-xl font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
            >
              Detected: <span className="text-white font-bold">"{detected}"</span>
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

        {!isSupported && (
          <div
            className="p-3 rounded-xl text-xs font-medium text-left"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d' }}
          >
            Voice recognition is not available in this browser.
          </div>
        )}

        <button
          onClick={() => handleSuccess('voice-demo')}
          className="w-full py-3 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          Continue with Demo Verification
        </button>
      </div>
    </div>
  );
}
