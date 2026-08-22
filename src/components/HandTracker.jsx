import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyGesture, GESTURE_MAP } from '../utils/signClassifier';
import { Volume2 } from 'lucide-react';

export default function HandTracker({ videoElement, isCameraActive, onGestureDetected }) {
  const canvasRef         = useRef(null);
  const landmarkerRef     = useRef(null);
  const animFrameRef      = useRef(null);
  const lastGestureTime   = useRef(0);

  const [aiStatus,      setAiStatus]     = useState('loading');
  const [handCount,     setHandCount]    = useState(0);
  const [currentGesture,setCurrentGesture] = useState(null);
  const [debugError,    setDebugError]   = useState('');

  /* ── Init MediaPipe ONCE ── */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setAiStatus('loading');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
        );
        const lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (mounted) { landmarkerRef.current = lm; setAiStatus('ready'); }
      } catch (err) {
        console.error('MediaPipe init error:', err);
        if (mounted) { setAiStatus('error'); setDebugError(err.message || 'Model load failed.'); }
      }
    })();

    return () => {
      mounted = false;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  /* ── Detection Loop ── */
  useEffect(() => {
    if (aiStatus !== 'ready' || !isCameraActive || !videoElement) return;

    const detect = () => {
      if (
        videoElement &&
        videoElement.readyState >= 2 &&
        landmarkerRef.current &&
        canvasRef.current
      ) {
        const { videoWidth: w, videoHeight: h } = videoElement;
        if (w > 0 && h > 0) {
          const canvas = canvasRef.current;
          if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, w, h);

          try {
            const results = landmarkerRef.current.detectForVideo(videoElement, performance.now());
            if (results.landmarks?.length > 0) {
              setHandCount(results.landmarks.length);
              results.landmarks.forEach(lm => {
                drawSkeleton(ctx, lm, w, h);
                const cls = classifyGesture(lm);
                const now = Date.now();
                if (cls.sign !== 'UNKNOWN' && now - lastGestureTime.current > 800) {
                  lastGestureTime.current = now;
                  const g = { ...cls, meta: GESTURE_MAP[cls.sign] || GESTURE_MAP.UNKNOWN };
                  setCurrentGesture(g);
                  onGestureDetected?.(g);
                }
              });
            } else {
              setHandCount(0);
            }
          } catch { /* safe */ }
        }
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [aiStatus, isCameraActive, videoElement, onGestureDetected]);

  /* ── Draw skeleton (mirrored X) ── */
  function drawSkeleton(ctx, lm, w, h) {
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[0,17],[17,18],[18,19],[19,20],
    ];
    ctx.strokeStyle = 'rgba(0,242,254,0.75)';
    ctx.lineWidth   = 2.5;
    CONNECTIONS.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo((1 - lm[i].x) * w, lm[i].y * h);
      ctx.lineTo((1 - lm[j].x) * w, lm[j].y * h);
      ctx.stroke();
    });
    lm.forEach(p => {
      ctx.beginPath();
      ctx.arc((1 - p.x) * w, p.y * h, 5, 0, 2 * Math.PI);
      ctx.fillStyle   = '#9D50BB';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 1.5;
      ctx.fill();
      ctx.stroke();
    });
  }

  const speak = () => {
    if (currentGesture?.meta?.speech && window.speechSynthesis) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(currentGesture.meta.speech));
    }
  };

  return (
    <>
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      {/* Hand Status badge */}
      <div className="absolute bottom-4 left-4 z-20">
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(0,242,254,0.25)',
            backdropFilter: 'blur(12px)',
            color: aiStatus === 'ready' ? '#00F2FE' : '#94A3B8',
          }}
        >
          {aiStatus === 'loading' && '🧠 Loading Hand AI...'}
          {aiStatus === 'ready' && (
            handCount === 0 ? '✋ Show your hand' :
            handCount === 1 ? '✋ 1 hand detected' :
            '✋ 2 hands detected'
          )}
          {aiStatus === 'error' && <span style={{ color: '#fca5a5' }}>🧠 Hand AI Fallback</span>}
        </div>
      </div>

      {/* AR Gesture Caption */}
      {currentGesture && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up">
          <div
            className="px-5 py-3 rounded-2xl text-center space-y-1"
            style={{
              background: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(0,242,254,0.4)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 32px rgba(0,242,254,0.2)',
            }}
          >
            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#00F2FE' }}>
              Detected Sign
            </div>
            <div className="text-2xl font-black text-white flex items-center justify-center gap-2">
              {currentGesture.meta.text} <span>{currentGesture.meta.emoji}</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold" style={{ color: '#94A3B8' }}>
              <span>Confidence: {Math.round(currentGesture.confidence * 100)}%</span>
              <button onClick={speak} style={{ color: '#00F2FE' }} title="Speak Gesture">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug error (keeps camera alive) */}
      {debugError && (
        <div
          className="absolute bottom-4 right-4 z-20 text-[10px] p-2 rounded-lg max-w-xs"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
        >
          Hand AI: {debugError}
        </div>
      )}
    </>
  );
}
