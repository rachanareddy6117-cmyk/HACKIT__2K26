import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyGesture, GESTURE_MAP } from '../utils/signClassifier';
import { useCamera } from '../utils/useMediaPermissions';

const LESSONS = [
  { tag: 'Lesson 1/5', sign: 'OPEN_HAND',   title: '👋 Open Hand',   desc: 'HELLO / Wave greeting.',   thumb: '👋', gloss: 'HELLO',  tip: 'Open your palm fully and wave toward the camera.' },
  { tag: 'Lesson 2/5', sign: 'THUMBS_UP',   title: '👍 Thumbs Up',   desc: 'YES / Affirmative.',       thumb: '✋', gloss: 'YES',    tip: 'Extend only your thumb upright with a closed fist.' },
  { tag: 'Lesson 3/5', sign: 'FIST',        title: '✊ Fist',         desc: 'STOP / Wait.',             thumb: '✊', gloss: 'STOP',   tip: 'Curl all fingers into a tight fist facing the camera.' },
  { tag: 'Lesson 4/5', sign: 'POINT',       title: '👉 Point',       desc: 'THERE / Directional.',     thumb: '👉', gloss: 'THERE',  tip: 'Extend only your index finger, pointing sideways.' },
  { tag: 'Lesson 5/5', sign: 'TWO_FINGERS', title: '✌️ Peace / Two', desc: 'PEACE / Number 2.',        thumb: '✌️', gloss: 'TWO',    tip: 'Raise index and middle fingers in a V shape.' },
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
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameRef  = useRef(null);
  const holdTimerRef  = useRef(null);

  const [lessonIdx, setLessonIdx] = useState(0);
  const lesson = LESSONS[lessonIdx];

  const [aiStatus, setAiStatus] = useState('idle');
  const [detecting, setDetecting] = useState(false);
  const [detectedSign, setDetectedSign] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'tryagain' | null
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [handCount, setHandCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0); // 0-100

  // ─── Init MediaPipe ───
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
          numHands: 1,
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
        if (mounted) setAiStatus('error');
      }
    })();
    return () => { mounted = false; landmarkerRef.current?.close(); };
  }, []);

  // ─── Attach camera ───
  useEffect(() => {
    if (cam.stream && videoRef.current) {
      videoRef.current.srcObject = cam.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [cam.stream]);

  // ─── Detection loop ───
  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !landmarkerRef.current || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const { videoWidth: w, videoHeight: h } = video;
    if (w <= 0 || h <= 0) { animFrameRef.current = requestAnimationFrame(detect); return; }
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    try {
      const results = landmarkerRef.current.detectForVideo(video, performance.now());
      if (results.landmarks?.length > 0) {
        setHandCount(results.landmarks.length);
        const lm = results.landmarks[0];

        // Draw skeleton
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 8;
        CONNECTIONS.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo((1 - lm[a].x) * w, lm[a].y * h);
          ctx.lineTo((1 - lm[b].x) * w, lm[b].y * h);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        lm.forEach(p => {
          ctx.beginPath();
          ctx.arc((1 - p.x) * w, p.y * h, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#9d50bb';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        });

        // Classify
        const cls = classifyGesture(lm);
        setDetectedSign(cls.sign);

        // Check against target
        if (detecting && cls.sign === lesson.sign) {
          if (!holdTimerRef.current) {
            holdTimerRef.current = Date.now();
          }
          const elapsed = Date.now() - holdTimerRef.current;
          const pct = Math.min(100, Math.round((elapsed / 1500) * 100)); // 1.5s hold
          setHoldProgress(pct);

          if (elapsed >= 1500) {
            // Confirmed match!
            setDetecting(false);
            setFeedback('correct');
            setScore(s => s + 10);
            setStreak(s => s + 1);
            holdTimerRef.current = null;
            setHoldProgress(0);

            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Correct! ${lesson.title} matched.`));
            }
          }
        } else {
          holdTimerRef.current = null;
          setHoldProgress(0);
        }
      } else {
        setHandCount(0);
        holdTimerRef.current = null;
        setHoldProgress(0);
      }
    } catch { /* frame skip */ }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [detecting, lesson]);

  useEffect(() => {
    if (cam.status === 'granted' && aiStatus === 'ready') {
      animFrameRef.current = requestAnimationFrame(detect);
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [cam.status, aiStatus, detect]);

  // Cleanup
  useEffect(() => () => cam.stop(), []);

  // ─── Actions ───
  const startDetect = async () => {
    if (cam.status !== 'granted') {
      await cam.request();
    }
    setDetecting(true);
    setFeedback(null);
    setDetectedSign(null);
    holdTimerRef.current = null;
    setHoldProgress(0);
  };

  const nextLesson = () => {
    setLessonIdx(i => (i + 1) % LESSONS.length);
    setFeedback(null); setDetectedSign(null); setDetecting(false);
    holdTimerRef.current = null; setHoldProgress(0);
  };

  const prevLesson = () => {
    setLessonIdx(i => (i - 1 + LESSONS.length) % LESSONS.length);
    setFeedback(null); setDetectedSign(null); setDetecting(false);
    holdTimerRef.current = null; setHoldProgress(0);
  };

  return (
    <div style={{ background: '#07090e', minHeight: '100vh', color: '#fff', fontFamily: "'Segoe UI',-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>⚡ Echo<span style={{ color: '#00f2fe' }}>Sign</span></span>
        <span style={{ fontSize: 12, color: '#8a99ad' }}>Practice Mode • /practice</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#00f2fe' }}>{score}</div>
            <div style={{ fontSize: 10, color: '#8a99ad' }}>SCORE</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: streak >= 3 ? '#ffcc00' : '#fff' }}>{streak}🔥</div>
            <div style={{ fontSize: 10, color: '#8a99ad' }}>STREAK</div>
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, alignSelf: 'center',
            background: aiStatus === 'ready' ? 'rgba(0,230,118,0.12)' : 'rgba(255,204,0,0.12)',
            border: `1px solid ${aiStatus === 'ready' ? '#00e676' : '#ffcc00'}`,
            color: aiStatus === 'ready' ? '#00e676' : '#ffcc00',
          }}>
            {aiStatus === 'loading' ? '🧠 Loading...' : aiStatus === 'ready' ? '🧠 AI Ready' : aiStatus === 'error' ? '⚠️ Fallback' : '🧠 Idle'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
          {LESSONS.map((_, i) => (
            <div key={i} onClick={() => { setLessonIdx(i); setFeedback(null); setDetecting(false); }} style={{
              flex: 1, height: 4, borderRadius: 4, cursor: 'pointer',
              background: i === lessonIdx ? '#00f2fe' : i < lessonIdx ? '#00e676' : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

          {/* Left: Lesson + Camera */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Lesson info */}
            <div style={{
              background: 'rgba(18,22,33,0.75)', border: '1px solid rgba(0,242,254,0.2)',
              borderRadius: 16, padding: '1.5rem', backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    background: 'rgba(0,242,254,0.12)', color: '#00f2fe',
                    border: '1px solid rgba(0,242,254,0.4)',
                    fontSize: '0.7rem', padding: '3px 10px', borderRadius: 12,
                  }}>{lesson.tag}</span>
                  <h2 style={{ marginTop: '0.6rem', fontSize: '1.5rem', fontWeight: 800 }}>{lesson.title}</h2>
                  <p style={{ color: '#8a99ad', fontSize: '0.85rem', marginTop: 2 }}>{lesson.desc}</p>
                </div>
                <div style={{
                  width: 70, height: 70, background: '#000',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
                }}>{lesson.thumb}</div>
              </div>

              <div style={{
                marginTop: '0.75rem', background: 'rgba(0,242,254,0.04)',
                border: '1px solid rgba(0,242,254,0.15)', borderRadius: 8,
                padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: '#8a99ad',
              }}>💡 <strong style={{ color: '#00f2fe' }}>Tip:</strong> {lesson.tip}</div>
            </div>

            {/* Camera feed */}
            <div style={{
              background: 'rgba(18,22,33,0.75)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, overflow: 'hidden', position: 'relative',
              minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
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
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  pointerEvents: 'none', zIndex: 2,
                }}
              />

              {/* No camera prompt */}
              {cam.status !== 'granted' && (
                <div style={{ textAlign: 'center', zIndex: 5, padding: '2rem' }}>
                  <div style={{ fontSize: 42, marginBottom: 12, opacity: 0.6 }}>📹</div>
                  <div style={{ fontSize: 13, color: '#8a99ad', marginBottom: 12 }}>
                    {cam.status === 'denied'
                      ? '⚠️ Camera access denied. Enable it in browser settings.'
                      : cam.status === 'requesting'
                        ? '⏳ Waiting for camera permission...'
                        : 'Enable your camera to practice sign gestures in real-time.'}
                  </div>
                  {cam.status !== 'requesting' && (
                    <button
                      onClick={() => cam.request()}
                      style={{
                        padding: '10px 22px', borderRadius: 10,
                        background: '#00f2fe', color: '#000',
                        fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                      }}
                    >📹 Enable Camera</button>
                  )}
                </div>
              )}

              {/* Hold progress bar */}
              {detecting && holdProgress > 0 && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 6, background: 'rgba(0,0,0,0.5)', zIndex: 10,
                }}>
                  <div style={{
                    height: '100%', width: `${holdProgress}%`,
                    background: holdProgress >= 80 ? '#00e676' : '#00f2fe',
                    transition: 'width 0.1s linear',
                    boxShadow: `0 0 8px ${holdProgress >= 80 ? '#00e676' : '#00f2fe'}`,
                  }} />
                </div>
              )}

              {/* Detection status overlay */}
              {cam.status === 'granted' && (
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(0,242,254,0.3)', borderRadius: 8,
                  padding: '6px 12px', zIndex: 3, fontSize: 12,
                }}>
                  {detecting ? (
                    <span style={{ color: '#00f2fe' }}>
                      🔍 Looking for: <strong>{lesson.gloss}</strong>
                      {detectedSign && ` · Seeing: ${detectedSign}`}
                      {holdProgress > 0 && ` · Hold: ${holdProgress}%`}
                    </span>
                  ) : (
                    <span style={{ color: '#8a99ad' }}>
                      ✋ Hands: {handCount} · Click Detect Sign to start
                    </span>
                  )}
                </div>
              )}

              {/* Feedback overlay */}
              {feedback === 'correct' && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 20,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    background: 'rgba(0,40,20,0.9)',
                    border: '2px solid #00e676', borderRadius: 16,
                    padding: '2rem', textAlign: 'center',
                    boxShadow: '0 0 30px rgba(0,230,118,0.3)',
                  }}>
                    <div style={{ fontSize: 48 }}>🎉</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#00e676', marginTop: 8 }}>
                      Correct! {lesson.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#8a99ad', marginTop: 4 }}>
                      +10 points · Streak: {streak}🔥
                    </div>
                    <button
                      onClick={nextLesson}
                      style={{
                        marginTop: 16, padding: '10px 24px', borderRadius: 10,
                        background: '#00e676', color: '#000',
                        fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14,
                      }}
                    >Next Lesson →</button>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={prevLesson} style={{
                padding: '0.75rem 1.25rem', borderRadius: 10,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                color: '#8a99ad', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              }}>← Prev</button>

              <button
                onClick={startDetect}
                disabled={detecting && cam.status === 'granted'}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10,
                  background: detecting ? 'rgba(0,242,254,0.15)' : '#00f2fe',
                  border: detecting ? '1px solid #00f2fe' : 'none',
                  color: detecting ? '#00f2fe' : '#000',
                  fontWeight: 700, cursor: detecting ? 'default' : 'pointer',
                  fontSize: '0.9rem',
                }}
              >{detecting ? '🔍 Detecting... Show your hand!' : '📷 Detect Sign'}</button>

              <button onClick={nextLesson} style={{
                padding: '0.75rem 1.25rem', borderRadius: 10,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                color: '#8a99ad', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              }}>Next →</button>
            </div>
          </div>

          {/* Right: Target reference */}
          <div>
            <h3 style={{
              fontSize: '0.85rem', fontWeight: 700, color: '#8a99ad',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem',
            }}>Target Sign Reference</h3>

            <div style={{
              background: 'rgba(18,22,33,0.75)', border: '1px solid rgba(0,242,254,0.2)',
              borderRadius: 16, padding: '1.5rem', marginBottom: '1rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 64 }}>{lesson.thumb}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#00f2fe', marginTop: 8 }}>{lesson.gloss}</div>
              <div style={{ fontSize: 12, color: '#8a99ad', marginTop: 4 }}>{lesson.desc}</div>
              <div style={{
                marginTop: 12, fontSize: 11, color: '#8a99ad',
                background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '8px',
              }}>
                Hold the sign for <strong style={{ color: '#00f2fe' }}>1.5 seconds</strong> to confirm
              </div>
            </div>

            <h3 style={{
              fontSize: '0.85rem', fontWeight: 700, color: '#8a99ad',
              textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem',
            }}>All Lessons</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LESSONS.map((l, i) => (
                <div
                  key={i}
                  onClick={() => { setLessonIdx(i); setFeedback(null); setDetecting(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                    background: i === lessonIdx ? 'rgba(0,242,254,0.1)' : 'rgba(18,22,33,0.5)',
                    border: `1px solid ${i === lessonIdx ? 'rgba(0,242,254,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{l.thumb}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: i === lessonIdx ? '#00f2fe' : '#fff' }}>{l.title}</div>
                    <div style={{ fontSize: 10, color: '#8a99ad' }}>{l.tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
