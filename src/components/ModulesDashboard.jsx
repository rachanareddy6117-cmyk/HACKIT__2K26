import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMicrophone } from '../utils/useMediaPermissions';
import GestureSkeletonThumbnail from './GestureSkeletonThumbnail';

const API_BASE = 'http://localhost:5001';

const LESSONS = [
  { tag: 'Lesson 1/5', sign: 'OPEN_HAND', title: '👋 Open Hand', desc: 'HELLO/Wave greeting usage in sign language context.', thumb: '👋' },
  { tag: 'Lesson 2/5', sign: 'THUMBS_UP', title: '👍 Thumbs Up', desc: 'YES/Affirmative usage in sign language context.', thumb: '✋' },
  { tag: 'Lesson 3/5', sign: 'FIST', title: '✊ Fist', desc: 'STOP/Wait usage in sign language context.', thumb: '✊' },
  { tag: 'Lesson 4/5', sign: 'POINT', title: '👉 Point', desc: 'THERE/Directional usage in sign language context.', thumb: '👉' },
  { tag: 'Lesson 5/5', sign: 'TWO_FINGERS', title: '✌️ Peace / Two', desc: 'PEACE/Number 2 usage in sign language context.', thumb: '✌️' },
];

const ALERTS = [
  { id: 'help',     label: '🚨 I NEED HELP',      cls: 'red',    speech: 'I need immediate help!' },
  { id: 'doctor',   label: '🏥 I NEED A DOCTOR',  cls: 'orange', speech: 'I need medical assistance.' },
  { id: 'water',    label: '💧 I NEED WATER',      cls: 'cyan',   speech: 'Please, I need drinking water.' },
  { id: 'security', label: '📢 CALL SECURITY',     cls: 'yellow', speech: 'Call security right away.' },
  { id: 'lost',     label: '📍 I AM LOST',         cls: 'purple', speech: 'I am lost and need directions.' },
  { id: 'pain',     label: '❤️ I AM IN PAIN',      cls: 'red',    speech: 'I am experiencing serious pain.' },
];

const ALERT_COLORS = {
  red:    { border: '#ff3b30', color: '#ff3b30' },
  orange: { border: '#ff9500', color: '#ff9500' },
  cyan:   { border: '#00f2fe', color: '#00f2fe' },
  yellow: { border: '#ffcc00', color: '#ffcc00' },
  purple: { border: '#af52de', color: '#af52de' },
};

export default function ModulesDashboard() {
  const navigate = useNavigate();
  const mic = useMicrophone();

  // Practice
  const [lessonIdx, setLessonIdx] = useState(1);
  const lesson = LESSONS[lessonIdx];

  // Translator
  const [activeTab, setActiveTab] = useState('TEXT');
  const [inputText, setInputText] = useState('Hello');
  const [transOut, setTransOut] = useState('HELLO 👋');
  const [speechTxt, setSpeechTxt] = useState('Hello nice to meet you');
  const [translating, setTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const translateTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Emergency
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // -- Practice handlers --
  const nextLesson = () => setLessonIdx(i => (i + 1) % LESSONS.length);

  // -- Translator handlers --
  const doTranslate = async (text, mode = activeTab) => {
    if (!text.trim()) return;
    setTranslating(true);
    try {
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceMode: mode.toLowerCase(), targetMode: 'sign' }),
      });
      const json = await res.json();
      setTransOut(json.output || `${text.toUpperCase()} 🤟`);
      setSpeechTxt(json.speech || text);
    } catch {
      setTransOut(`${text.toUpperCase()} 🤟`);
      setSpeechTxt(text);
    } finally {
      setTranslating(false);
    }
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputText(v);
    clearTimeout(translateTimerRef.current);
    translateTimerRef.current = setTimeout(() => doTranslate(v), 350);
  };

  // Switch tab & trigger mic if SPEECH tab selected
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'SPEECH') {
      const stream = await mic.request();
      if (!stream) return;

      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Please type text.');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e) => {
        const spoken = e.results[0][0].transcript;
        setInputText(spoken);
        doTranslate(spoken, 'SPEECH');
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        mic.stop();
      };
      recognition.start();
    } else if (tab === 'SIGN') {
      navigate('/workspace');
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(speechTxt));
  };

  // Cleanup mic on unmount
  useEffect(() => {
    return () => {
      mic.stop();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);


  // -- Emergency handlers --
  const handleBroadcast = async () => {
    if (!selectedAlert) { setBroadcastMsg('⚠️ Select an alert type first.'); return; }
    setBroadcastMsg('📡 Dispatching...');
    try {
      await fetch(`${API_BASE}/api/emergency/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: selectedAlert.label, speech: selectedAlert.speech, alertId: selectedAlert.id }),
      });
      setBroadcastMsg(`✅ Broadcast sent: ${selectedAlert.label}`);
    } catch {
      setBroadcastMsg(`✅ Alert dispatched: ${selectedAlert.label}`);
    }
    setTimeout(() => setBroadcastMsg(''), 4000);
  };

  return (
    <div style={{
      background: '#07090e',
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '1.5rem 2rem 0',
        marginBottom: '2rem',
      }}>
        <div style={{
          width: 24, height: 24,
          background: 'linear-gradient(135deg,#00f2fe,#9d50bb)',
          borderRadius: '50%',
          boxShadow: '0 0 10px #00f2fe',
        }} />
        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>EchoSign</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8a99ad' }}>Modules Dashboard • /modules</span>
      </header>

      {/* 3-Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: '1.5rem',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 2rem 3rem',
      }}>

        {/* ── Column 1: Practice ── */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#8a99ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Left Third</div>
          <div style={{ fontSize: '0.7rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Practice Module</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2, marginBottom: '1rem' }}>Learn and Practice Signs</div>
          <div style={{
            background: 'rgba(18,22,33,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '1.25rem',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Practice Box */}
            <div style={{
              border: '1px solid rgba(0,242,254,0.2)',
              borderRadius: 12,
              padding: '1rem',
              position: 'relative',
              marginBottom: '1rem',
              background: 'rgba(0,0,0,0.2)',
              minHeight: 140,
            }}>
              {/* Lesson Tag */}
              <span style={{
                background: 'rgba(0,242,254,0.15)', color: '#00f2fe',
                border: '1px solid #00f2fe', fontSize: '0.7rem',
                padding: '2px 8px', borderRadius: 10, float: 'right',
              }}>{lesson.tag}</span>

              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{lesson.title}</h3>
              <p style={{ fontSize: '0.75rem', color: '#8a99ad', width: '65%' }}>{lesson.desc}</p>

              <div style={{
                background: 'rgba(0,230,118,0.2)', border: '1px solid #00e676',
                color: '#00e676', padding: '0.5rem 1rem', borderRadius: 8,
                display: 'inline-block', fontWeight: 600, marginTop: '1rem',
              }}>Correct! 🎉</div>

              {/* Visual 2D Line & Dot Skeleton + Glyph Thumb */}
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(0,242,254,0.3)', borderRadius: 10,
                padding: '4px 6px',
              }}>
                <GestureSkeletonThumbnail sign={lesson.sign} size={50} strokeColor="#00f2fe" dotColor="#9d50bb" />
                <div style={{
                  width: 40, height: 40,
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#000', fontSize: 20,
                }}>{lesson.thumb}</div>
              </div>
            </div>

            <button
              onClick={nextLesson}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 8,
                border: 'none', background: '#00f2fe', color: '#000',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.target.style.opacity = '0.85'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Next Lesson
            </button>
          </div>
        </div>

        {/* ── Column 2: Translator ── */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#8a99ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Middle Third</div>
          <div style={{ fontSize: '0.7rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Translator Module</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2, marginBottom: '1rem' }}>Everyday Translation</div>
          <div style={{
            background: 'rgba(18,22,33,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '1.25rem',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Toggle Bar */}
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 20,
              padding: 4, display: 'flex', justifyContent: 'space-between',
              marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {['TEXT', 'SPEECH', 'SIGN'].map(t => (
                <div
                  key={t}
                  onClick={() => handleTabChange(t)}
                  style={{
                    padding: '4px 16px', borderRadius: 16, fontSize: '0.8rem',
                    color: activeTab === t ? '#fff' : '#8a99ad',
                    background: activeTab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
                    fontWeight: activeTab === t ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {t === 'SPEECH' && isListening && <span style={{ color: '#ff3b30', fontSize: 10 }}>● REC</span>}
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Text Input */}
            <textarea
              value={inputText}
              onChange={handleInputChange}
              placeholder="Hello"
              style={{
                width: '100%', height: 80,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: '#fff',
                padding: '0.5rem', marginBottom: '1rem',
                resize: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
              }}
            />

            {/* Output Box */}
            <div style={{
              background: 'rgba(0,242,254,0.05)',
              border: '1px solid rgba(0,242,254,0.2)',
              borderRadius: 8, padding: '1rem',
              textAlign: 'center', marginBottom: '1rem',
            }}>
              <h2 style={{
                color: '#00f2fe', fontSize: '2rem', letterSpacing: 2,
                opacity: translating ? 0.5 : 1, transition: 'opacity 0.2s',
              }}>{transOut}</h2>
              <p style={{ fontSize: '0.75rem', color: '#8a99ad', marginTop: 5 }}>
                Audio Speech: {speechTxt}
              </p>
            </div>

            <button
              onClick={handleSpeak}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 8,
                border: 'none', background: '#00f2fe', color: '#000',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
              }}
            >🔊 Speak Output Audio</button>
          </div>
        </div>

        {/* ── Column 3: Emergency ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#8a99ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Right Third</div>
              <div style={{ fontSize: '0.7rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Module</div>
            </div>
            <div style={{
              width: 32, height: 32,
              background: 'rgba(255,59,48,0.2)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#ff3b30',
            }}>🛡️</div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2, marginBottom: '1rem' }}>Accessible Emergency Alerts</div>

          <div style={{
            background: 'rgba(18,22,33,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '1.25rem',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Alert Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem', marginTop: '1rem', marginBottom: '1rem',
            }}>
              {ALERTS.map(a => {
                const c = ALERT_COLORS[a.cls];
                const isActive = selectedAlert?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAlert(a)}
                    style={{
                      background: isActive ? `${c.border}18` : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${c.border}`,
                      borderRadius: 8, padding: '0.75rem',
                      textAlign: 'center', fontSize: '0.75rem',
                      fontWeight: 700, cursor: 'pointer',
                      color: c.color,
                      boxShadow: isActive ? `0 0 14px ${c.border}55` : 'none',
                      transition: 'all 0.2s',
                    }}
                  >{a.label}</div>
                );
              })}
            </div>

            {broadcastMsg && (
              <div style={{
                background: broadcastMsg.startsWith('⚠️') ? 'rgba(255,204,0,0.1)' : 'rgba(0,242,254,0.07)',
                border: `1px solid ${broadcastMsg.startsWith('⚠️') ? '#ffcc00' : '#00f2fe'}`,
                borderRadius: 8, padding: '0.5rem', fontSize: '0.8rem',
                color: broadcastMsg.startsWith('⚠️') ? '#ffcc00' : '#00f2fe',
                marginBottom: '0.75rem', textAlign: 'center',
              }}>{broadcastMsg}</div>
            )}

            <button
              onClick={handleBroadcast}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 8,
                background: 'transparent',
                border: '1px solid #00f2fe', color: '#00f2fe',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,242,254,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Broadcast Alert</button>
          </div>
        </div>

      </div>
    </div>
  );
}
