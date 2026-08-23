import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyGesture } from '../utils/signClassifier';
import { useCamera } from '../utils/useMediaPermissions';

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20],
];

export default function LiveSignInput({ onGestureStabilized }) {
  const cam = useCamera();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [aiStatus, setAiStatus] = useState('loading'); // loading | ready | error
  const [currentGesture, setCurrentGesture] = useState(null);
  const [showSuccessTick, setShowSuccessTick] = useState(false);
  
  // Stabilization refs
  const historyRef = useRef([]); // Stores last N detected signs
  const lastStabilizedRef = useRef(null);
  const cooldownRef = useRef(0);

  // Initialize MediaPipe
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
        );
        const lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1, // Focus on 1 hand for translation clarity
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (mounted) {
          landmarkerRef.current = lm;
          setAiStatus('ready');
        }
      } catch (err) {
        console.error('MediaPipe initialization error:', err);
        if (mounted) setAiStatus('error');
      }
    })();
    return () => {
      mounted = false;
      landmarkerRef.current?.close();
    };
  }, []);

  // Request & Attach Camera
  useEffect(() => {
    cam.request();
    return () => cam.stop();
  }, []);

  useEffect(() => {
    if (cam.stream && videoRef.current) {
      videoRef.current.srcObject = cam.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [cam.stream]);

  // Drawing Helper
  const drawSkeleton = (ctx, landmarks, w, h) => {
    ctx.save();
    ctx.strokeStyle = '#00f2fe'; // Neon cyan
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10;

    CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo((1 - landmarks[a].x) * w, landmarks[a].y * h);
      ctx.lineTo((1 - landmarks[b].x) * w, landmarks[b].y * h);
      ctx.stroke();
    });

    landmarks.forEach((p, idx) => {
      const isTip = [4,8,12,16,20].includes(idx);
      ctx.beginPath();
      ctx.arc((1 - p.x) * w, p.y * h, isTip ? 5 : 3, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? '#00f2fe' : '#9d50bb'; // Purple joints, Cyan tips
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  };

  // Main Loop
  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState < 2 || !landmarkerRef.current) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    try {
      const results = landmarkerRef.current.detectForVideo(video, performance.now());
      if (results.landmarks && results.landmarks.length > 0) {
        const liveLm = results.landmarks[0];
        
        // Draw Skeleton
        drawSkeleton(ctx, liveLm, w, h);

        // Classify Gesture
        const detected = classifyGesture(liveLm);
        setCurrentGesture(detected);

        // Stabilization Algorithm
        if (cooldownRef.current > 0) {
          cooldownRef.current -= 1;
        } else {
          // Add to history
          historyRef.current.push(detected.sign);
          if (historyRef.current.length > 15) {
            historyRef.current.shift();
          }

          // Check if the last 15 frames are the same and NOT UNKNOWN
          const allSame = historyRef.current.every(s => s === detected.sign);
          if (allSame && detected.sign !== 'UNKNOWN' && detected.sign !== lastStabilizedRef.current) {
            // We have a stable, new gesture!
            let textToAppend = detected.text.split(' / ')[0].split(' (')[0]; // Simplify "LETTER V / PEACE" -> "LETTER V"
            if (detected.sign.startsWith('ASL_')) {
                // E.g. ASL_B -> B
                textToAppend = detected.sign.replace('ASL_', '');
            } else if (detected.sign === 'THUMBS_UP') { textToAppend = 'YES'; }
            else if (detected.sign === 'THUMBS_DOWN') { textToAppend = 'NO'; }
            else if (detected.sign === 'OPEN_HAND') { textToAppend = 'HELLO'; }
            else if (detected.sign === 'FIST') { textToAppend = 'STOP'; }
            else if (detected.sign === 'POINT') { textToAppend = 'THERE'; }
            
            if (onGestureStabilized) {
              onGestureStabilized(textToAppend);
            }
            
            // Flash a green tick mark for success!
            setShowSuccessTick(true);
            setTimeout(() => setShowSuccessTick(false), 1200);

            lastStabilizedRef.current = detected.sign;
            cooldownRef.current = 40; // Wait ~1.3 seconds before accepting a new sign to prevent spam
          }
        }
      } else {
        // No hand detected
        setCurrentGesture(null);
        historyRef.current = [];
        // Reset last stabilized if hand is removed so they can do the same gesture again
        if (cooldownRef.current === 0) {
          lastStabilizedRef.current = null;
        } else {
           cooldownRef.current -= 1;
        }
      }
    } catch (err) {
      console.error(err);
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [onGestureStabilized]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(detect);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [detect]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 220, borderRadius: 16, overflow: 'hidden', background: '#0a0d14' }}>
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror
          display: cam.status === 'granted' ? 'block' : 'none',
        }}
      />
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          pointerEvents: 'none', zIndex: 2,
        }}
      />

      {/* Permissions UI */}
      {cam.status !== 'granted' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/40">
          <div className="text-3xl mb-3">📹</div>
          <p className="text-sm text-slate-300 mb-4 font-medium max-w-xs">
            {cam.status === 'denied' ? 'Camera access denied. Please allow it in browser settings.' 
             : cam.status === 'requesting' ? 'Requesting camera access...' 
             : 'Camera access is required for real-time sign detection.'}
          </p>
          {cam.status !== 'requesting' && (
             <button onClick={() => cam.request()} className="px-5 py-2.5 bg-cyan-500 text-black font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                Enable Camera
             </button>
          )}
        </div>
      )}

      {/* Status Overlay */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
         {aiStatus === 'loading' && (
            <span className="px-3 py-1 text-[10px] font-bold rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm">
               Loading AI Model...
            </span>
         )}
         {aiStatus === 'ready' && currentGesture && currentGesture.sign !== 'UNKNOWN' && (
             <span className="px-3 py-1 text-[10px] font-bold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                 Tracking: {currentGesture.emoji} {currentGesture.sign.replace('ASL_', '')}
             </span>
         )}
      </div>

      {/* Success Green Tick Mark Overlay */}
      {showSuccessTick && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#00e676]/10 backdrop-blur-sm">
          <div className="flex items-center justify-center w-32 h-32 rounded-full border-[4px] border-[#00e676] bg-[#071c18] shadow-[0_0_60px_rgba(0,230,118,0.7)] animate-bounce">
            <span className="text-[72px] text-[#00e676] -translate-y-1">✔️</span>
          </div>
        </div>
      )}
    </div>
  );
}
