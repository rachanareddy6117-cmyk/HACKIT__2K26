import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { classifyGesture, GESTURE_MAP } from '../utils/signClassifier';
import { useCamera, useMicrophone } from '../utils/useMediaPermissions';

const API_BASE = 'http://localhost:5001';

const CHAT_INIT = [
  { role: 'ai', text: "Hi! I'm Echo Assistant. Start your camera to detect sign gestures in real-time!" },
];

/* ─── Hand Connections for drawing the skeleton ─── */
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20],
];

export default function WorkspacePage() {
  // Camera + Mic permissions
  const cam = useCamera();
  const mic = useMicrophone();

  // Video + Canvas refs
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameRef  = useRef(null);

  // Detection state
  const [aiStatus, setAiStatus]    = useState('idle');     // idle | loading | ready | error
  const [handCount, setHandCount]  = useState(0);
  const [activeSign, setActiveSign]= useState('—');
  const [confidence, setConfidence]= useState(0);
  const [gestureHistory, setGestureHistory] = useState([]);

  // Chat state
  const [chat, setChat]       = useState(CHAT_INIT);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ─── 1. Init MediaPipe HandLandmarker once ───
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

  // ─── 2. Attach camera stream to <video> when granted ───
  useEffect(() => {
    if (cam.stream && videoRef.current) {
      videoRef.current.srcObject = cam.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [cam.stream]);

  // ─── 3. Detection loop — draws skeleton + classifies gesture ───
  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !landmarkerRef.current || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const { videoWidth: w, videoHeight: h } = video;
    if (w <= 0 || h <= 0) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    try {
      const results = landmarkerRef.current.detectForVideo(video, performance.now());
      if (results.landmarks?.length > 0) {
        setHandCount(results.landmarks.length);

        // Draw each detected hand
        results.landmarks.forEach((lm) => {
          // Connections
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

          // Joints
          ctx.shadowBlur = 0;
          lm.forEach(p => {
            ctx.beginPath();
            ctx.arc((1 - p.x) * w, p.y * h, 4.5, 0, 2 * Math.PI);
            ctx.fillStyle = '#9d50bb';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
          });
        });

        // Classify gesture from first hand
        const cls = classifyGesture(results.landmarks[0]);
        const meta = GESTURE_MAP[cls.sign] || GESTURE_MAP.UNKNOWN || { text: cls.sign, emoji: '🤟' };
        const sign = `${meta.text || cls.sign} ${meta.emoji || ''}`.trim();
        const conf = cls.confidence || 94;

        if (sign !== activeSign) {
          setActiveSign(sign);
          setConfidence(conf);
          setGestureHistory(h => {
            const next = [{ sign, conf, time: new Date().toLocaleTimeString() }, ...h];
            return next.slice(0, 15);
          });
        }
      } else {
        setHandCount(0);
      }
    } catch {
      // frame skip
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [activeSign]);

  // Start / stop detection loop based on camera state
  useEffect(() => {
    if (cam.status === 'granted' && aiStatus === 'ready') {
      animFrameRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cam.status, aiStatus, detect]);

  // ─── 4. Auto-scroll chat ───
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // ─── 5. Chat submit ───
  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput('');
    setChat(c => [...c, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const json = await res.json();
      setChat(c => [...c, { role: 'ai', text: json.reply || `Echo received: "${msg}"` }]);
    } catch {
      setChat(c => [...c, { role: 'ai', text: `Echo: "${msg}" processed. Tracker active.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ─── 6. Handle speech input via mic ───
  const handleSpeechInput = async () => {
    const s = await mic.request();
    if (!s) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setChat(c => [...c, { role: 'ai', text: 'Speech recognition is not supported in this browser.' }]);
      mic.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setChatInput(transcript);
      setChat(c => [...c, { role: 'user', text: `🎤 ${transcript}` }]);
      // Auto-send
      fetch(`${API_BASE}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript }),
      })
        .then(r => r.json())
        .then(json => setChat(c => [...c, { role: 'ai', text: json.reply || transcript }]))
        .catch(() => setChat(c => [...c, { role: 'ai', text: `Echo received voice: "${transcript}"` }]));
    };

    recognition.onerror = () => {
      setChat(c => [...c, { role: 'ai', text: '🎤 Could not recognize speech. Try again.' }]);
    };

    recognition.onend = () => mic.stop();
    recognition.start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { cam.stop(); mic.stop(); };
  }, []);

  // ─── RENDER ───
  return (
    <div style={{ background: '#07090e', minHeight: '100vh', color: '#fff', fontFamily: "'Segoe UI',-apple-system,sans-serif" }}>
      {/* Top bar */}
      <div style={{
        background: 'rgba(12,16,24,0.95)', borderBottom: '1px solid rgba(0,242,254,0.15)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>⚡ Echo<span style={{ color: '#00f2fe' }}>Sign</span></span>
        <span style={{ fontSize: 12, color: '#8a99ad' }}>Live Workspace • /workspace</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* AI status */}
          <span style={{
            padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
            background: aiStatus === 'ready' ? 'rgba(0,230,118,0.12)' : aiStatus === 'loading' ? 'rgba(255,204,0,0.12)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${aiStatus === 'ready' ? '#00e676' : aiStatus === 'loading' ? '#ffcc00' : 'rgba(255,255,255,0.15)'}`,
            color: aiStatus === 'ready' ? '#00e676' : aiStatus === 'loading' ? '#ffcc00' : '#8a99ad',
          }}>
            {aiStatus === 'loading' && '🧠 Loading MediaPipe...'}
            {aiStatus === 'ready' && '🧠 AI Ready'}
            {aiStatus === 'error' && '⚠️ AI Fallback'}
            {aiStatus === 'idle' && '🧠 AI Idle'}
          </span>

          {/* Camera status */}
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: cam.status === 'granted' ? '#00e676' : cam.status === 'requesting' ? '#ffcc00' : '#ff3b30',
            display: 'inline-block',
            boxShadow: `0 0 8px ${cam.status === 'granted' ? '#00e676' : '#ff3b30'}`,
          }} />
          <span style={{ fontSize: 12, color: cam.status === 'granted' ? '#00e676' : '#8a99ad' }}>
            {cam.status === 'granted' ? '📹 Camera Live' : cam.status === 'requesting' ? '📹 Requesting...' : '📹 Camera Off'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 53px)', overflow: 'hidden' }}>

        {/* ── Left Sidebar ── */}
        <div style={{
          width: 200, background: 'rgba(12,16,24,0.8)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {[
            { icon: '🤟', label: 'Sign Tracker', active: true },
            { icon: '📝', label: 'Practice Mode' },
            { icon: '🌐', label: 'Translator' },
            { icon: '🚨', label: 'Emergency' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
              background: item.active ? 'rgba(0,242,254,0.1)' : 'transparent',
              border: item.active ? '1px solid rgba(0,242,254,0.25)' : '1px solid transparent',
              color: item.active ? '#00f2fe' : '#8a99ad', fontSize: 13,
            }}><span>{item.icon}</span><span>{item.label}</span></div>
          ))}

          {/* Recent gestures */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
            <div style={{ fontSize: 10, color: '#8a99ad', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Recent Detections</div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {gestureHistory.length === 0 && (
                <div style={{ fontSize: 11, color: '#8a99ad', fontStyle: 'italic' }}>No gestures yet</div>
              )}
              {gestureHistory.map((g, i) => (
                <div key={i} style={{
                  fontSize: 11, padding: '3px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  color: i === 0 ? '#00f2fe' : '#8a99ad',
                }}>
                  {g.sign} <span style={{ fontSize: 9, opacity: 0.6 }}>{g.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center: Camera Feed ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem' }}>
          <div style={{
            flex: 1,
            background: 'rgba(18,22,33,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, backdropFilter: 'blur(10px)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {cam.status === 'granted' && (
                <span style={{
                  background: '#ff3b30', color: '#fff',
                  fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                  animation: 'pulse 1.5s infinite',
                }}>● LIVE</span>
              )}
              <span style={{ fontSize: 13, color: '#8a99ad' }}>Hand Tracking · MediaPipe Vision Engine</span>
              {handCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#00e676', fontWeight: 700 }}>
                  ✋ {handCount} hand{handCount > 1 ? 's' : ''} detected
                </span>
              )}
            </div>

            {/* Camera area */}
            <div style={{
              flex: 1, position: 'relative',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Hidden video element */}
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror
                  display: cam.status === 'granted' ? 'block' : 'none',
                }}
              />

              {/* Canvas overlay for skeleton */}
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  pointerEvents: 'none', zIndex: 2,
                }}
              />

              {/* No camera state — request button */}
              {cam.status !== 'granted' && (
                <div style={{ textAlign: 'center', zIndex: 5, padding: '2rem' }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>📹</div>
                  <div style={{ fontSize: 14, color: '#8a99ad', marginBottom: 12 }}>
                    {cam.status === 'denied'
                      ? '⚠️ Camera access was denied.'
                      : cam.status === 'error'
                        ? (cam.error || 'Camera not available.')
                        : cam.status === 'requesting'
                          ? '⏳ Waiting for camera permission...'
                          : 'Camera is required for real-time gesture detection.'}
                  </div>
                  {cam.status !== 'requesting' && (
                    <button
                      onClick={() => cam.request()}
                      style={{
                        padding: '10px 24px', borderRadius: 10,
                        background: '#00f2fe', color: '#000',
                        fontWeight: 700, fontSize: 14, border: 'none',
                        cursor: 'pointer', transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.target.style.opacity = '0.85'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    >📹 Enable Camera</button>
                  )}
                  {cam.status === 'denied' && (
                    <div style={{ fontSize: 11, color: '#ff3b30', marginTop: 8 }}>
                      Please allow camera access in your browser's address bar → 🔒
                    </div>
                  )}
                </div>
              )}

              {/* Detected sign badge */}
              {cam.status === 'granted' && (
                <div style={{
                  position: 'absolute', bottom: 16, left: 16,
                  background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(0,242,254,0.3)',
                  borderRadius: 10, padding: '10px 16px', zIndex: 3,
                }}>
                  <div style={{ fontSize: '0.95rem' }}>
                    Detected Sign: <strong style={{ color: '#00f2fe' }}>{activeSign}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8a99ad', marginTop: 2 }}>
                    Confidence: {confidence}% · Hands: {handCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Echo AI Chat ── */}
        <div style={{
          width: 300, background: 'rgba(12,16,24,0.8)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>✨ Echo Assistant</span>
            <span style={{ fontSize: 12, color: '#00e676' }}>• AI Online</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${m.role === 'user' ? 'rgba(0,242,254,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '8px 12px', fontSize: 13, color: '#fff', maxWidth: '85%',
              }}>{m.text}</div>
            ))}
            {chatLoading && (
              <div style={{
                alignSelf: 'flex-start', fontSize: 12, color: '#8a99ad',
                padding: '6px 10px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              }}>Echo is thinking...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input row */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 6,
          }}>
            <button
              onClick={handleSpeechInput}
              title="Voice input (requires microphone)"
              style={{
                background: mic.status === 'granted' ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${mic.status === 'granted' ? '#ff3b30' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 8, padding: '8px', cursor: 'pointer',
                color: mic.status === 'granted' ? '#ff3b30' : '#8a99ad', fontSize: 14,
              }}
            >🎤</button>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Type or speak..."
              style={{
                flex: 1, background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#fff', padding: '8px 12px',
                fontSize: 13, fontFamily: 'inherit',
              }}
            />
            <button
              onClick={sendChat}
              style={{
                background: '#00f2fe', color: '#000', border: 'none',
                borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                fontWeight: 700, fontSize: 13,
              }}
            >→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
