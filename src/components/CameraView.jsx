import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Camera, CameraOff, Volume2, VolumeX, AlertCircle, RefreshCw } from 'lucide-react';

const CameraView = forwardRef(({ onGestureDetected }, ref) => {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState('off');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [muted,       setMuted]       = useState(false);

  useImperativeHandle(ref, () => ({
    getVideoElement:  () => videoRef.current,
    isCameraActive:   () => cameraState === 'active',
  }));

  const startCamera = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('error');
        setErrorMsg('No camera support detected in browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
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

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div
      className="relative w-full h-full min-h-[320px] flex items-center justify-center rounded-2xl overflow-hidden"
      style={{
        background: '#05070A',
        border: cameraState === 'active'
          ? '1px solid rgba(0,242,254,0.25)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: cameraState === 'active' ? '0 0 40px rgba(0,242,254,0.08)' : 'none',
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`w-full h-full object-cover -scale-x-100 ${cameraState === 'active' ? 'block' : 'hidden'}`}
      />

      {/* Controls bar — top right */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5"
        style={{
          background: 'rgba(0,0,0,0.65)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          padding: '6px 8px',
        }}
      >
        <button
          onClick={cameraState === 'active' ? stopCamera : startCamera}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
          style={{
            background: cameraState === 'active' ? 'rgba(239,68,68,0.15)' : 'rgba(0,242,254,0.1)',
            color: cameraState === 'active' ? '#ef4444' : '#00F2FE',
            border: cameraState === 'active' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,242,254,0.25)',
          }}
        >
          {cameraState === 'active' ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {cameraState === 'active' ? 'Off' : 'On'}
        </button>

        <button
          onClick={() => setMuted(!muted)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: muted ? '#475569' : '#9D50BB' }}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* LIVE badge — top left */}
      <div
        className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase"
        style={{
          background: 'rgba(0,0,0,0.65)',
          border: cameraState === 'active' ? '1px solid rgba(0,242,254,0.3)' : '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(10px)',
          color: cameraState === 'active' ? '#00F2FE' : '#475569',
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: cameraState === 'active' ? '#00F2FE' : '#475569',
            boxShadow: cameraState === 'active' ? '0 0 8px #00F2FE' : 'none',
            animation: cameraState === 'active' ? 'blink 1.4s ease-in-out infinite' : 'none',
          }}
        />
        {cameraState === 'active' ? 'LIVE' : 'OFF'}
      </div>

      {/* Error / Offline Placeholder */}
      {cameraState !== 'active' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4 z-10">
          <AlertCircle className="w-12 h-12" style={{ color: '#475569' }} />
          <div className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            {errorMsg || 'Camera is disabled.'}
          </div>
          <button
            onClick={startCamera}
            className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg,#00F2FE,#9D50BB)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(0,242,254,0.2)',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Enable Camera
          </button>
        </div>
      )}
    </div>
  );
});

export default CameraView;
