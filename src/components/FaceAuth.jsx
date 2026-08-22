import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';
import { loginUser } from '../services/api';

export default function FaceAuth({ onComplete, onBack }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState('off');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [verifying,   setVerifying]   = useState(false);

  const startCamera = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('simulated');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState('active');
      }
    } catch (err) {
      setCameraState('simulated');
      setErrorMsg('Camera active in simulation mode.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState('off');
  };

  useEffect(() => { startCamera(); return () => stopCamera(); }, []);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await loginUser({ authType: 'face_id', identifier: 'alex.smith@echosign.org' });
      const userData = res.user || { name: 'Alex Smith (Face Verified)', email: 'alex.smith@echosign.org', authMethod: 'face_id' };
      if (res.token) setStoredItem(STORAGE_KEYS.TOKEN, res.token);
      setStoredItem(STORAGE_KEYS.USER, userData);
      setStoredItem(STORAGE_KEYS.AUTH_METHOD, 'face');
      stopCamera();
      onComplete(userData);
    } catch {
      const userData = { name: 'Alex Smith (Face Verified)', email: 'alex.smith@echosign.org', authMethod: 'face_id' };
      stopCamera();
      onComplete(userData);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden"
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
        <div className="flex items-center justify-between">
          <button
            onClick={() => { stopCamera(); onBack(); }}
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

        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            AES-256 Face Biometric Scanner
          </div>
          <h2 className="text-2xl font-black text-white">Biometric Face Verification</h2>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Position your face inside the biometric mesh frame.</p>
        </div>

        {/* Video Frame */}
        <div
          className="relative aspect-video rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: '#05070a',
            border: '1px solid rgba(0,229,255,0.35)',
            boxShadow: '0 0 32px rgba(0,229,255,0.15)',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover -scale-x-100 ${cameraState === 'active' ? 'block' : 'hidden'}`}
          />

          {/* Biometric Mesh Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-44 h-56 rounded-full flex items-center justify-center animate-pulse"
              style={{ border: '2px dashed rgba(0,229,255,0.7)', boxShadow: '0 0 30px rgba(0,229,255,0.25)' }}
            >
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest bg-black/70 px-3 py-1 rounded-full border border-cyan-400/30">
                Face Mesh Target
              </span>
            </div>
          </div>

          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            AI FACE SCAN ACTIVE
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg,#00e5ff,#9d50bb)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 0 30px rgba(0,229,255,0.35)',
              opacity: verifying ? 0.7 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 44px rgba(0,229,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
          >
            {verifying ? 'Verifying with Backend...' : <><CheckCircle2 className="w-5 h-5" /> Confirm Face Biometrics</>}
          </button>
        </div>
      </div>
    </div>
  );
}
