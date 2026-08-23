import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyGesture, matchTargetGesture, TARGET_SKELETON_TEMPLATES, GESTURE_MAP } from '../utils/signClassifier';
import { useCamera } from '../utils/useMediaPermissions';
import GestureSkeletonThumbnail from './GestureSkeletonThumbnail';

const LESSONS = [
  {
    id: 1,
    tag: 'Lesson 1/5',
    sign: 'OPEN_HAND',
    title: '👋 Open Hand',
    desc: 'HELLO / Wave greeting in sign language context.',
    thumb: '👋',
    gloss: 'HELLO',
    tip: 'Open all 5 fingers fully facing the camera viewfinder.',
    instruction: 'Keep your palm open towards the lens.'
  },
  {
    id: 2,
    tag: 'Lesson 2/5',
    sign: 'THUMBS_UP',
    title: '👍 Thumbs Up',
    desc: 'YES / Affirmative usage in sign language context.',
    thumb: '✋',
    gloss: 'YES',
    tip: 'Make a fist and point only your thumb directly upwards.',
    instruction: 'Point your thumb straight up towards the ceiling.'
  },
  {
    id: 3,
    tag: 'Lesson 3/5',
    sign: 'FIST',
    title: '✊ Fist',
    desc: 'STOP / Wait usage in sign language context.',
    thumb: '✊',
    gloss: 'STOP',
    tip: 'Curl all fingers tightly into a fist facing forward.',
    instruction: 'Keep all 5 fingers closed against your palm.'
  },
  {
    id: 4,
    tag: 'Lesson 4/5',
    sign: 'POINT',
    title: '👉 Point',
    desc: 'THERE / Directional usage in sign language context.',
    thumb: '👉',
    gloss: 'THERE',
    tip: 'Extend only your index finger while curling other fingers.',
    instruction: 'Point index finger straight up or sideways.'
  },
  {
    id: 5,
    tag: 'Lesson 5/5',
    sign: 'TWO_FINGERS',
    title: '✌️ Peace / Two',
    desc: 'PEACE / Number 2 usage in sign language context.',
    thumb: '✌️',
    gloss: 'TWO',
    tip: 'Extend index and middle fingers in a clear V-shape.',
    instruction: 'Make a peace sign with index and middle fingers.'
  },
];

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20],
];

export default function PracticePage() {
  const cam = useCamera();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameRef = useRef(null);
  const holdStartTimeRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const [lessonIdx, setLessonIdx] = useState(0);
  const lesson = LESSONS[lessonIdx];

  const [aiStatus, setAiStatus] = useState('idle'); // idle | loading | ready | error
  const [matchScore, setMatchScore] = useState(0);
  const [isMatched, setIsMatched] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState(null);
  const [matchFeedback, setMatchFeedback] = useState('Position your hand on the dotted guide');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [handCount, setHandCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0); // 0-100%

  // ─── 1. Init MediaPipe HandLandmarker ───
  useEffect(() => {
    let mounted = true;
    (async () => {
      setAiStatus('loading');
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
          numHands: 2,
          minHandDetectionConfidence: 0.4,
          minHandPresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
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

  // ─── 2. Attach Camera Stream ───
  useEffect(() => {
    if (cam.stream && videoRef.current) {
      videoRef.current.srcObject = cam.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [cam.stream]);

  // ─── 3. Auto-request camera on mount ───
  useEffect(() => {
    cam.request();
    return () => {
      cam.stop();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // ─── 4. Reset match state on lesson change ───
  useEffect(() => {
    setIsMatched(false);
    setMatchScore(0);
    setHoldProgress(0);
    holdStartTimeRef.current = null;
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [lessonIdx]);

  // ─── 5. Match confirmed handler (Quick auto-advance) ───
  const triggerMatchConfirmed = useCallback(() => {
    if (isMatched) return;
    setIsMatched(true);
    setMatchScore(100);
    setHoldProgress(100);
    setScore(s => s + 10);
    setStreak(st => st + 1);

    // Audio confirmation
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Correct!`);
      window.speechSynthesis.speak(u);
    }

    countdownTimerRef.current = setTimeout(() => {
      setLessonIdx(prev => (prev + 1) % LESSONS.length);
    }, 1500);
  }, [isMatched, lesson]);

  // ─── 6. Drawing Helpers ───
  const drawTargetDottedGuideOnScreen = (ctx, template, w, h, isAligned) => {
    if (!template || template.length < 21) return;

    ctx.save();
    const strokeColor = isAligned ? '#00e676' : '#00f2fe';
    const dotColor = isAligned ? '#00e676' : '#9d50bb';

    // Dotted lines
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = isAligned ? 20 : 12;

    CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath();
      // Draw centered in the user's camera viewpoint
      ctx.moveTo(template[a].x * w, template[a].y * h);
      ctx.lineTo(template[b].x * w, template[b].y * h);
      ctx.stroke();
    });

    // Joint Nodes
    ctx.setLineDash([]);
    template.forEach((pt, idx) => {
      const isTip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, isTip ? 6.5 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? strokeColor : dotColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });

    // Dynamic Top Label Tag on Canvas
    ctx.font = 'bold 12px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = strokeColor;
    ctx.textAlign = 'center';
    ctx.fillText(`◌ TARGET GUIDE: ${lesson.title}`, template[9].x * w, (template[12].y * h) - 22);
    ctx.restore();
  };

  const drawLiveUserSkeleton = (ctx, landmarks, w, h, isAligned) => {
    ctx.save();
    const liveStroke = isAligned ? '#00e676' : '#f59e0b';
    ctx.strokeStyle = liveStroke;
    ctx.lineWidth = 3.2;
    ctx.shadowColor = liveStroke;
    ctx.shadowBlur = isAligned ? 18 : 10;

    CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath();
      // Mirror X coordinates to match mirrored video
      ctx.moveTo((1 - landmarks[a].x) * w, landmarks[a].y * h);
      ctx.lineTo((1 - landmarks[b].x) * w, landmarks[b].y * h);
      ctx.stroke();
    });

    landmarks.forEach(p => {
      ctx.beginPath();
      ctx.arc((1 - p.x) * w, p.y * h, 5, 0, 2 * Math.PI);
      ctx.fillStyle = isAligned ? '#00e676' : '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  };

  // ─── 7. Main Real-time Detection Loop ───
  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    // 1. Always draw the current lesson's Target Dotted Guide ON SCREEN
    const template = TARGET_SKELETON_TEMPLATES[lesson.sign];
    let isAlignedNow = false;

    try {
      if (video.readyState >= 2 && landmarkerRef.current) {
        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        if (results.landmarks && results.landmarks.length > 0) {
          setHandCount(results.landmarks.length);
          const liveLm = results.landmarks[0];

          // Check match
          const matchResult = matchTargetGesture(liveLm, lesson.sign, template);
          setMatchScore(matchResult.score);
          setMatchFeedback(matchResult.feedback);
          setDetectedGesture(matchResult.detectedText || matchResult.detectedSign);
          isAlignedNow = matchResult.isMatched;

          // 2. Draw live hand skeleton
          drawLiveUserSkeleton(ctx, liveLm, w, h, isAlignedNow);

          if (isAlignedNow && !isMatched) {
            if (!holdStartTimeRef.current) {
              holdStartTimeRef.current = Date.now();
            }
            const elapsed = Date.now() - holdStartTimeRef.current;
            const progressPct = Math.min(100, Math.round((elapsed / 1000) * 100)); // 1s hold
            setHoldProgress(progressPct);

            if (elapsed >= 1000) {
              triggerMatchConfirmed();
            }
          } else if (!isAlignedNow && !isMatched) {
            holdStartTimeRef.current = null;
            setHoldProgress(0);
          }
        } else {
          setHandCount(0);
          setMatchScore(0);
          setMatchFeedback('Position your hand on the dotted guide');
          setDetectedGesture(null);
          if (!isMatched) {
            holdStartTimeRef.current = null;
            setHoldProgress(0);
          }
        }
      }
    } catch {
      // safe frame skip
    }

    // Draw target dotted guide with current alignment state
    if (template) {
      drawTargetDottedGuideOnScreen(ctx, template, w, h, isAlignedNow || isMatched);
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [lesson, isMatched, triggerMatchConfirmed]);

  // Start / stop loop
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(detect);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [detect]);

  return (
    <div style={{
      background: '#07090e',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: "'Segoe UI',-apple-system,sans-serif",
    }}>
      {/* ── Top Header ── */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(12,16,24,0.95)',
      }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>⚡ Echo<span style={{ color: '#00f2fe' }}>Sign</span></span>
        <span style={{ fontSize: 12, color: '#8a99ad' }}>Interactive Practice Mode • /practice</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#00f2fe' }}>{score}</div>
            <div style={{ fontSize: 10, color: '#8a99ad' }}>SCORE</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: streak >= 3 ? '#ffcc00' : '#fff' }}>{streak}🔥</div>
            <div style={{ fontSize: 10, color: '#8a99ad' }}>STREAK</div>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
            background: aiStatus === 'ready' ? 'rgba(0,230,118,0.12)' : aiStatus === 'loading' ? 'rgba(255,204,0,0.12)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${aiStatus === 'ready' ? '#00e676' : aiStatus === 'loading' ? '#ffcc00' : 'rgba(255,255,255,0.15)'}`,
            color: aiStatus === 'ready' ? '#00e676' : aiStatus === 'loading' ? '#ffcc00' : '#8a99ad',
          }}>
            {aiStatus === 'loading' ? '🧠 Loading MediaPipe...' : aiStatus === 'ready' ? '🧠 AI Vision Live' : '⚠️ Fallback Active'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
        {/* ── Progress Indicators ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
          {LESSONS.map((l, i) => (
            <div
              key={i}
              onClick={() => setLessonIdx(i)}
              style={{
                flex: 1, height: 6, borderRadius: 4, cursor: 'pointer',
                background: i === lessonIdx ? '#00f2fe' : i < lessonIdx ? '#00e676' : 'rgba(255,255,255,0.1)',
                boxShadow: i === lessonIdx ? '0 0 10px #00f2fe' : 'none',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* ── Main 2-Column Split ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

          {/* Left Column: Lesson Card & Real-time Camera Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Lesson Target Header Card */}
            <div style={{
              background: 'rgba(18,22,33,0.75)',
              border: '1px solid rgba(0,242,254,0.25)',
              borderRadius: 16, padding: '1.25rem 1.5rem',
              backdropFilter: 'blur(10px)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{
                  background: 'rgba(0,242,254,0.15)', color: '#00f2fe',
                  border: '1px solid rgba(0,242,254,0.4)',
                  fontSize: '0.75rem', padding: '3px 10px', borderRadius: 12,
                  fontWeight: 700,
                }}>{lesson.tag}</span>
                <h2 style={{ marginTop: '0.4rem', fontSize: '1.6rem', fontWeight: 800 }}>{lesson.title}</h2>
                <p style={{ color: '#8a99ad', fontSize: '0.85rem', marginTop: 2 }}>{lesson.desc}</p>
                <div style={{
                  marginTop: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1',
                }}>
                  💡 <strong style={{ color: '#00f2fe' }}>Posture:</strong> {lesson.instruction}
                </div>
              </div>

              {/* Top-Right 2D Line & Dot Skeleton Diagram + Visual Glyph */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(0,242,254,0.3)', borderRadius: 14,
                padding: '6px 10px',
                boxShadow: '0 0 16px rgba(0,242,254,0.15)',
              }}>
                <GestureSkeletonThumbnail sign={lesson.sign} size={64} strokeColor="#00f2fe" dotColor="#9d50bb" />
                <div style={{
                  width: 54, height: 54, background: '#000',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {lesson.thumb}
                </div>
              </div>
            </div>

            {/* Real-time Camera View with Dotted Target Guide ON SCREEN */}
            <div style={{
              background: 'rgba(18,22,33,0.75)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, overflow: 'hidden',
              position: 'relative', minHeight: 380,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: cam.status === 'granted' ? 'block' : 'none',
                }}
              />

              {/* Canvas Overlay for Dotted Line Guide ON SCREEN */}
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  pointerEvents: 'none', zIndex: 2,
                }}
              />

              {/* Camera permission prompt */}
              {cam.status !== 'granted' && (
                <div style={{ textAlign: 'center', zIndex: 5, padding: '2rem' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📹</div>
                  <div style={{ fontSize: 14, color: '#8a99ad', marginBottom: 12 }}>
                    {cam.status === 'denied'
                      ? '⚠️ Camera access was denied. Please allow camera access in your browser.'
                      : cam.status === 'requesting'
                        ? '⏳ Waiting for camera permission...'
                        : 'Camera required to detect and match your hand gestures.'}
                  </div>
                  {cam.status !== 'requesting' && (
                    <button
                      onClick={() => cam.request()}
                      style={{
                        padding: '10px 24px', borderRadius: 10,
                        background: '#00f2fe', color: '#000',
                        fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                      }}
                    >📹 Enable Camera</button>
                  )}
                </div>
              )}

              {/* Hold Progress Bar */}
              {holdProgress > 0 && !isMatched && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 8, background: 'rgba(0,0,0,0.6)', zIndex: 10,
                }}>
                  <div style={{
                    height: '100%', width: `${holdProgress}%`,
                    background: holdProgress >= 80 ? 'linear-gradient(90deg, #00e676, #00f2fe)' : '#00f2fe',
                    transition: 'width 0.1s linear',
                    boxShadow: '0 0 10px #00e676',
                  }} />
                </div>
              )}

              {/* Bottom Left Match Badge */}
              <div style={{
                position: 'absolute', bottom: 16, left: 16,
                background: 'rgba(10,14,20,0.85)', backdropFilter: 'blur(12px)',
                border: `1px solid ${matchScore >= 80 ? 'rgba(0,230,118,0.5)' : 'rgba(0,242,254,0.3)'}`,
                borderRadius: 12, padding: '8px 14px', zIndex: 3,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: matchScore >= 80 ? '#00e676' : '#00f2fe',
                    boxShadow: `0 0 8px ${matchScore >= 80 ? '#00e676' : '#00f2fe'}`,
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {detectedGesture ? `Detected: ${detectedGesture}` : 'Scanning Hand...'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#8a99ad', marginTop: 2 }}>
                  {matchFeedback}
                </div>
              </div>

              {/* Match Confirmed Celebration Overlay (Green Tick Mark) */}
              {isMatched && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 30,
                  background: 'rgba(0,230,118,0.15)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    background: '#071c18',
                    border: '4px solid #00e676', borderRadius: '50%',
                    width: 130, height: 130,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 60px rgba(0,230,118,0.7)',
                    animation: 'scaleIn 0.3s ease-out'
                  }}>
                    <span style={{ fontSize: 72, color: '#00e676', transform: 'translateY(-2px)' }}>✔️</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation & Fast-Forward Controls */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => setLessonIdx(p => (p - 1 + LESSONS.length) % LESSONS.length)}
                style={{
                  padding: '0.75rem 1.25rem', borderRadius: 10,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#8a99ad', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                }}
              >
                ← Prev Lesson
              </button>

              <button
                onClick={triggerMatchConfirmed}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10,
                  background: 'rgba(0,242,254,0.15)', border: '1px solid #00f2fe',
                  color: '#00f2fe', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <span>⚡ Simulate / Force Match Sign</span>
              </button>

              <button
                onClick={() => setLessonIdx(p => (p + 1) % LESSONS.length)}
                style={{
                  padding: '0.75rem 1.25rem', borderRadius: 10,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#8a99ad', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                }}
              >
                Next Lesson →
              </button>
            </div>
          </div>

          {/* Right Column: Real-time Dotted Alignment Score Meter & Lesson Roster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Live Alignment Meter */}
            <div style={{
              background: 'rgba(18,22,33,0.75)',
              border: '1px solid rgba(0,242,254,0.25)',
              borderRadius: 16, padding: '1.25rem',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: 11, color: '#8a99ad', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                Live Alignment Score
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: matchScore >= 80 ? '#00e676' : '#00f2fe' }}>
                  {matchScore}%
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                  background: matchScore >= 80 ? 'rgba(0,230,118,0.2)' : 'rgba(0,242,254,0.15)',
                  color: matchScore >= 80 ? '#00e676' : '#00f2fe',
                }}>
                  {matchScore >= 80 ? 'MATCH READY' : 'ALIGNING...'}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%', height: 10, borderRadius: 5,
                background: 'rgba(0,0,0,0.4)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${matchScore}%`,
                  background: matchScore >= 80 ? 'linear-gradient(90deg, #00e676, #4ade80)' : 'linear-gradient(90deg, #00f2fe, #9d50bb)',
                  boxShadow: matchScore >= 80 ? '0 0 12px #00e676' : 'none',
                  transition: 'width 0.15s ease-out',
                }} />
              </div>

              <div style={{ marginTop: 10, fontSize: 11, color: '#8a99ad', lineHeight: 1.4 }}>
                Align your hand directly on the <strong style={{ color: '#00f2fe' }}>Cyan Dotted Guide ON SCREEN</strong>. Hold for 1 second once aligned.
              </div>
            </div>

            {/* Lesson Roster */}
            <div style={{
              background: 'rgba(18,22,33,0.75)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '1.25rem',
            }}>
              <div style={{ fontSize: 11, color: '#8a99ad', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, marginBottom: 10 }}>
                Practice Lesson Modules
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {LESSONS.map((l, i) => {
                  const active = i === lessonIdx;
                  return (
                    <div
                      key={l.id}
                      onClick={() => setLessonIdx(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                        background: active ? 'rgba(0,242,254,0.15)' : 'rgba(0,0,0,0.25)',
                        border: `1px solid ${active ? '#00f2fe' : 'rgba(255,255,255,0.05)'}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{l.thumb}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#00f2fe' : '#fff', truncate: true }}>
                          {l.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#8a99ad' }}>{l.tag}</div>
                      </div>
                      {i < lessonIdx && <span style={{ color: '#00e676', fontSize: 14 }}>✔</span>}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
