import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyGesture, matchTargetGesture, GESTURE_MAP } from '../utils/signClassifier';
import { CheckCircle2, Volume2, Sparkles, Timer, Eye } from 'lucide-react';
import SignIllustration from './SignIllustration';

export default function HandTracker({
  videoElement,
  isCameraActive,
  targetModule,
  onGestureDetected,
  onMatchSuccess,
  themeMode = 'deaf_mute' // 'deaf_mute' (Royal Blue) | 'autism_introvert' (Terracotta Orange)
}) {
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameRef = useRef(null);
  const matchStartTime = useRef(null);
  const countdownIntervalRef = useRef(null);

  const [aiStatus, setAiStatus] = useState('loading');
  const [handCount, setHandCount] = useState(0);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [isMatched, setIsMatched] = useState(false);
  const [countdown, setCountdown] = useState(null); // 5 .. 1
  const [debugError, setDebugError] = useState('');

  const isDeafTheme = themeMode === 'deaf_mute' || themeMode === 'deaf_hoh' || themeMode === 'sign_learner';
  const primaryColor = isDeafTheme ? '#2563EB' : '#EA580C';
  const secondaryColor = isDeafTheme ? '#1E40AF' : '#C2410C';
  const accentGlow = isDeafTheme ? 'rgba(37,99,235,0.4)' : 'rgba(234,88,12,0.4)';

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
        if (mounted) {
          landmarkerRef.current = lm;
          setAiStatus('ready');
        }
      } catch (err) {
        console.error('MediaPipe init error:', err);
        if (mounted) {
          setAiStatus('error');
          setDebugError(err.message || 'Model load fallback active');
        }
      }
    })();

    return () => {
      mounted = false;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  // Reset match state when targetModule changes
  useEffect(() => {
    setIsMatched(false);
    setCountdown(null);
    matchStartTime.current = null;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [targetModule?.id]);

  /* ── Hand Match Success & 5-Second Countdown Handler ── */
  const triggerMatchConfirmed = useCallback(() => {
    if (isMatched) return;
    setIsMatched(true);
    setCountdown(5);

    // Audio chime & speech confirmation
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `Correct! ${targetModule?.title || 'Gesture'} matched successfully.`
      );
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    let timeLeft = 5;
    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        onMatchSuccess?.(targetModule);
      }
    }, 1000);
  }, [isMatched, targetModule, onMatchSuccess]);

  /* ── Detection & Skeleton Drawing Loop ── */
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
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, w, h);

          // 1. Draw Target Dotted Line Skeleton Guide if targetModule is provided
          if (targetModule?.skeletonTemplate) {
            drawDottedTargetSkeleton(ctx, targetModule.skeletonTemplate, w, h, isDeafTheme);
          }

          try {
            const results = landmarkerRef.current.detectForVideo(videoElement, performance.now());
            if (results.landmarks?.length > 0) {
              setHandCount(results.landmarks.length);
              const liveLm = results.landmarks[0];

              // Draw live tracked hand skeleton
              drawLiveHandSkeleton(ctx, liveLm, w, h, isMatched);

              const cls = classifyGesture(liveLm);
              const g = { ...cls, meta: GESTURE_MAP[cls.sign] || GESTURE_MAP.UNKNOWN };
              setCurrentGesture(g);
              onGestureDetected?.(g);

              // Calculate match against target module
              if (targetModule) {
                const matchResult = matchTargetGesture(
                  liveLm,
                  targetModule.targetSign,
                  targetModule.skeletonTemplate
                );
                setMatchScore(matchResult.score);

                if (matchResult.isMatched && !isMatched) {
                  if (!matchStartTime.current) {
                    matchStartTime.current = Date.now();
                  } else if (Date.now() - matchStartTime.current > 450) {
                    // Confirmed match held for >450ms
                    triggerMatchConfirmed();
                  }
                } else if (!matchResult.isMatched && !isMatched) {
                  matchStartTime.current = null;
                }
              }
            } else {
              setHandCount(0);
              setMatchScore(0);
              if (!isMatched) matchStartTime.current = null;
            }
          } catch {
            /* safe frame skip */
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [aiStatus, isCameraActive, videoElement, targetModule, isMatched, isDeafTheme, onGestureDetected, triggerMatchConfirmed]);

  /* ── Draw Target DOTTED Skeleton (Reference Guide) ── */
  function drawDottedTargetSkeleton(ctx, tmpl, w, h, isDeaf) {
    if (!tmpl || tmpl.length < 21) return;

    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[0,17],[17,18],[18,19],[19,20],
    ];

    // Scale and position target skeleton comfortably in camera center-right
    const guideColor = isDeaf ? '#60A5FA' : '#FB923C';
    const dotColor = isDeaf ? '#93C5FD' : '#FED7AA';

    ctx.save();
    ctx.setLineDash([7, 6]); // Crisply Dotted Lines
    ctx.strokeStyle = guideColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = guideColor;
    ctx.shadowBlur = 12;

    CONNECTIONS.forEach(([i, j]) => {
      ctx.beginPath();
      // Mirror X so it aligns with user's perspective
      ctx.moveTo(tmpl[i].x * w, tmpl[i].y * h);
      ctx.lineTo(tmpl[j].x * w, tmpl[j].y * h);
      ctx.stroke();
    });

    ctx.setLineDash([]); // Reset line dash for joint nodes
    tmpl.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20 ? 6.5 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = dotColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.fill();
      ctx.stroke();
    });

    // "TARGET POSE ALIGNMENT GUIDE" label on top of dotted skeleton
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = guideColor;
    ctx.textAlign = 'center';
    ctx.fillText('◌ TARGET DOTTED GUIDE', tmpl[9].x * w, (tmpl[12].y * h) - 20);
    ctx.restore();
  }

  /* ── Draw Live Tracked User Hand Skeleton ── */
  function drawLiveHandSkeleton(ctx, lm, w, h, matched) {
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[0,17],[17,18],[18,19],[19,20],
    ];

    ctx.save();
    ctx.strokeStyle = matched ? '#22C55E' : (isDeafTheme ? '#00F2FE' : '#F59E0B');
    ctx.lineWidth = 3.2;
    ctx.shadowColor = matched ? '#22C55E' : (isDeafTheme ? '#00F2FE' : '#F59E0B');
    ctx.shadowBlur = 10;

    CONNECTIONS.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo((1 - lm[i].x) * w, lm[i].y * h);
      ctx.lineTo((1 - lm[j].x) * w, lm[j].y * h);
      ctx.stroke();
    });

    lm.forEach(p => {
      ctx.beginPath();
      ctx.arc((1 - p.x) * w, p.y * h, 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = matched ? '#22C55E' : (isDeafTheme ? '#9D50BB' : '#EA580C');
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  return (
    <>
      {/* Canvas Overlay for Dotted Line & Real-time Landmarks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      {/* ── TOP RIGHT: Target Gesture Display Card (Reference PDF Theme) ── */}
      {targetModule && (
        <div
          className="absolute top-4 right-4 z-20 max-w-[260px] sm:max-w-[300px] w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 animate-fade-in-up"
          style={{
            background: isDeafTheme
              ? 'linear-gradient(180deg, #1E3A8A 0%, #172554 100%)'
              : 'linear-gradient(180deg, #9A3412 0%, #7C2D12 100%)',
            border: isDeafTheme
              ? '2px solid rgba(59,130,246,0.6)'
              : '2px solid rgba(249,115,22,0.6)',
            boxShadow: `0 12px 32px ${accentGlow}`,
          }}
        >
          {/* Card Top Title Banner */}
          <div
            className="px-3.5 py-2 flex items-center justify-between text-white border-b"
            style={{
              background: isDeafTheme ? '#2563EB' : '#EA580C',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Sign</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              Level {targetModule.level || 1} • Mod {targetModule.module || 1}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-3.5 space-y-2.5 text-white">
            {/* Top Row: Visual Sign Picture & Title */}
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center p-1 shadow-inner flex-shrink-0 relative overflow-hidden"
                style={{
                  background: isDeafTheme ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.45)',
                  border: isDeafTheme ? '1px solid rgba(96,165,250,0.4)' : '1px solid rgba(251,146,60,0.4)',
                }}
              >
                <SignIllustration
                  sign={targetModule.targetSign || 'OPEN_HAND'}
                  emoji={targetModule.emoji}
                  size={48}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black truncate flex items-center gap-1.5">
                  <span>{targetModule.emoji}</span>
                  <span>{targetModule.title}</span>
                </div>
                <div className="text-[11px] text-white/80 font-medium line-clamp-1">
                  {targetModule.subtitle || targetModule.instruction}
                </div>
              </div>
            </div>

            {/* Instruction Cue from PDF */}
            <div
              className="text-[10px] p-2 rounded-lg leading-snug font-medium"
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#F1F5F9',
              }}
            >
              <span className="font-bold text-yellow-300">Posture: </span>
              {targetModule.instruction || targetModule.description}
            </div>

            {/* Match Confidence Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-white/80">Dotted Match Score</span>
                <span style={{ color: matchScore >= 80 ? '#4ADE80' : '#F8FAFC' }}>
                  {matchScore}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${matchScore}%`,
                    background: matchScore >= 80
                      ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
                      : (isDeafTheme
                          ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                          : 'linear-gradient(90deg, #F97316, #FDBA74)'),
                    boxShadow: matchScore >= 80 ? '0 0 10px #22C55E' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Quick Simulate / Test Button */}
            <button
              onClick={triggerMatchConfirmed}
              className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              style={{
                background: isDeafTheme ? 'rgba(37,99,235,0.3)' : 'rgba(234,88,12,0.3)',
                border: isDeafTheme ? '1px solid rgba(96,165,250,0.4)' : '1px solid rgba(251,146,60,0.4)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isDeafTheme ? 'rgba(37,99,235,0.5)' : 'rgba(234,88,12,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDeafTheme ? 'rgba(37,99,235,0.3)' : 'rgba(234,88,12,0.3)'; }}
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>⚡ Match Sign (Test / Fast-Forward)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MATCH CONFIRMED TICK MARK & 5s COUNTDOWN OVERLAY ── */}
      {isMatched && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="p-8 rounded-3xl text-center space-y-4 max-w-sm mx-4 transform scale-105 transition-transform"
            style={{
              background: isDeafTheme
                ? 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)'
                : 'linear-gradient(135deg, #9A3412 0%, #1C1917 100%)',
              border: '2px solid #22C55E',
              boxShadow: '0 0 50px rgba(34,197,94,0.4)',
            }}
          >
            {/* Animated Checkmark Circle */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-green-500/30 border-2 border-green-400 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-12 h-12 text-green-400 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-wide">
                MATCH CONFIRMED! ✔️
              </h2>
              <p className="text-xs font-semibold text-green-300">
                {targetModule?.title || 'Gesture'} Perfect 100% Alignment
              </p>
            </div>

            {/* 5-Second Countdown Timer Badge */}
            <div
              className="px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-mono text-sm font-bold text-white shadow-inner"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Timer className="w-4 h-4 text-green-400 animate-spin" />
              <span>Next Module in <span className="text-green-400 text-base">{countdown}s</span>...</span>
            </div>

            <button
              onClick={() => {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                onMatchSuccess?.(targetModule);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:opacity-90"
              style={{
                background: 'linear-gradient(90deg, #22C55E, #16A34A)',
                boxShadow: '0 0 20px rgba(34,197,94,0.4)',
              }}
            >
              Continue Now →
            </button>
          </div>
        </div>
      )}

      {/* ── BOTTOM LEFT: Live Hand Status Badge ── */}
      <div className="absolute bottom-4 left-4 z-20">
        <div
          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          style={{
            background: 'rgba(15,23,42,0.85)',
            border: `1px solid ${isDeafTheme ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'}`,
            backdropFilter: 'blur(16px)',
            color: aiStatus === 'ready' ? (isDeafTheme ? '#60A5FA' : '#FB923C') : '#94A3B8',
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          {aiStatus === 'loading' && '🧠 Loading Vision AI...'}
          {aiStatus === 'ready' && (
            handCount === 0
              ? '✋ Place hand on screen dotted line'
              : `✋ Hand detected (${handCount}) • ${currentGesture?.meta?.text || 'Tracking'}`
          )}
          {aiStatus === 'error' && <span className="text-rose-400">Vision Fallback Active</span>}
        </div>
      </div>
    </>
  );
}
