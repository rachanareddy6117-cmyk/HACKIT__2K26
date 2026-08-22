import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Logo from './Logo';
import { setStoredItem, STORAGE_KEYS } from '../utils/storage';

export default function FaceAuth({ onComplete, onBack }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState('off');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [verifying,   setVerifying]   = useState(false);

  const startCamera = async () => {
    setErrorMsg('');
    try {
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
      if (err.name === 'NotAllowedError')   { setCameraState('denied'); setErrorMsg('Camera permission was denied.'); }
      else if (err.name === 'NotFoundError') { setCameraState('error');  setErrorMsg('No camera was found.'); }
      else if (err.name === 'NotReadableError') { setCameraState('error'); setErrorMsg('Camera is being used by another application.'); }
      else { setCameraState('error'); setErrorMsg(err.message || 'Could not start camera.'); }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState('off');
  };

  useEffect(() => { startCamera(); return () => stopCamera(); }, []);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      const userData = { name: 'Face Verified User', authMethod: 'face', timestamp: new Date().toISOString() };
      setStoredItem(STORAGE_KEYS.USER, userData);
      setStoredItem(STORAGE_KEYS.AUTH_METHOD, 'face');
      stopCamera();
      onComplete(userData);
    }, 1200);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: 'linear-gradient(180deg,#05070A,#0B0E14)' }}
    >
      <div
        className="w-full max-w-lg p-8 rounded-3xl space-y-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(0,242,254,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => { stopCamera(); onBack(); }}
            className="inline-flex items-center gap-2 text-sm font-bold transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#00F2FE'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Logo size="small" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black text-white">Face Verification</h2>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Position your face inside the frame.</p>
        </div>

        {/* Video */}
        <div
          className="relative aspect-video rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: '#05070A',
            border: cameraState === 'active'
              ? '1px solid rgba(0,242,254,0.35)'
              : '1px solid rgba(255,255,255,0.07)',
            boxShadow: cameraState === 'active' ? '0 0 32px rgba(0,242,254,0.12)' : 'none',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover -scale-x-100 ${cameraState === 'active' ? 'block' : 'hidden'}`}
          />

          {/* Face guide border */}
          {cameraState === 'active' && (
            <div
              className="absolute inset-0 m-8 rounded-full pointer-events-none"
              style={{ border: '2px dashed rgba(0,242,254,0.45)' }}
            />
          )}

          {cameraState !== 'active' && (
            <div className="text-center space-y-3 p-6">
              <AlertCircle className="w-10 h-10 mx-auto" style={{ color: '#94A3B8' }} />
              <div className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                {errorMsg || 'Camera is off.'}
              </div>
            </div>
          )}

          {/* LIVE badge */}
          {cameraState === 'active' && (
            <div
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,242,254,0.3)', color: '#00F2FE' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-blink" style={{ background: '#00F2FE' }} />
              LIVE
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {cameraState === 'active' ? (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
                color: '#fff',
                boxShadow: '0 0 28px rgba(0,242,254,0.25)',
                opacity: verifying ? 0.7 : 1,
              }}
            >
              {verifying ? 'Verifying...' : <><CheckCircle2 className="w-5 h-5" /> Verify My Face</>}
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
                color: '#fff',
                boxShadow: '0 0 28px rgba(0,242,254,0.25)',
              }}
            >
              <Camera className="w-5 h-5" /> Enable Camera
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] font-semibold pt-1" style={{ color: '#475569' }}>
            <span>Status: <span style={{ color: cameraState === 'active' ? '#00F2FE' : '#94A3B8' }}>
              {cameraState === 'active' ? 'Camera Active' : 'Camera Off'}
            </span></span>
            {cameraState === 'active' && (
              <button onClick={stopCamera} style={{ color: '#94A3B8' }} className="hover:underline">Turn Off</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
