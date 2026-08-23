import React, { useState } from 'react';
import { translateApi, broadcastEmergencyApi } from '../services/api';

const PRACTICE_LESSONS = [
  { id: 1, sign: 'OPEN_HAND', title: '👋 Open Hand', emoji: '👋', desc: 'HELLO / Wave greeting usage in sign language context.', tag: 'Lesson 1/5' },
  { id: 2, sign: 'THUMBS_UP', title: '👍 Thumbs Up', emoji: '✋', desc: 'YES/Affirmative usage in sign language context.', tag: 'Lesson 2/5' },
  { id: 3, sign: 'FIST', title: '✊ Fist', emoji: '✊', desc: 'STOP / Wait usage in sign language context.', tag: 'Lesson 3/5' },
  { id: 4, sign: 'POINT', title: '👉 Point', emoji: '👉', desc: 'THERE / Directional usage in sign language context.', tag: 'Lesson 4/5' },
  { id: 5, sign: 'TWO_FINGERS', title: '✌️ Peace / Two', emoji: '✌️', desc: 'PEACE / Number 2 usage in sign language context.', tag: 'Lesson 5/5' },
];

const EMERGENCY_ALERTS = [
  { id: 'help', label: '🚨 I NEED HELP', type: 'alert-red', speech: 'I need immediate help!' },
  { id: 'doctor', label: '🏥 I NEED A DOCTOR', type: 'alert-orange', speech: 'I need medical assistance from a doctor.' },
  { id: 'water', label: '💧 I NEED WATER', type: 'alert-cyan', speech: 'Please I need drinking water.' },
  { id: 'security', label: '📢 CALL SECURITY', type: 'alert-yellow', speech: 'Call security officers right away.' },
  { id: 'lost', label: '📍 I AM LOST', type: 'alert-purple', speech: 'I am lost and need directions.' },
  { id: 'pain', label: '❤️ I AM IN PAIN', type: 'alert-red', speech: 'I am experiencing serious pain.' },
];

export default function ModulesView({ onNavigateWorkspace, user, persona, onLogout, onChangePersona }) {
  // Practice state
  const [lessonIdx, setLessonIdx] = useState(1); // start on Lesson 2 as mock
  const currentLesson = PRACTICE_LESSONS[lessonIdx];

  // Translator state
  const [activeTab, setActiveTab] = useState('TEXT');
  const [inputText, setInputText] = useState('Hello');
  const [translatedResult, setTranslatedResult] = useState({
    output: 'HELLO 👋',
    speech: 'Hello nice to meet you'
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Emergency state
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [broadcastStatus, setBroadcastStatus] = useState('');

  const nextLesson = () => {
    setLessonIdx((prev) => (prev + 1) % PRACTICE_LESSONS.length);
  };

  const handleTranslate = async (textToTranslate) => {
    const text = textToTranslate ?? inputText;
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const res = await translateApi(text.trim(), activeTab);
      if (res && res.output) {
        setTranslatedResult({
          output: res.output,
          speech: res.speech || `Translation for ${text}`
        });
      } else {
        setTranslatedResult({
          output: `${text.toUpperCase()} 🤟`,
          speech: `Translated: ${text}`
        });
      }
    } catch {
      setTranslatedResult({
        output: `${text.toUpperCase()} 🤟`,
        speech: `Audio Speech: ${text} in sign language context`
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const speakAudio = () => {
    if (window.speechSynthesis && translatedResult?.speech) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(translatedResult.speech);
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerAlert = (alert) => {
    setSelectedAlert(alert);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(alert.speech));
    }
    broadcastEmergencyApi({
      alertId: alert.id,
      label: alert.label,
      speech: alert.speech,
      location: 'EchoSign Accessibility Platform'
    }).catch(() => {});
    setBroadcastStatus(`Broadcasting: "${alert.speech}"`);
  };

  const broadcastCurrentAlert = () => {
    const alert = selectedAlert || EMERGENCY_ALERTS[0];
    triggerAlert(alert);
  };

  return (
    <div style={{
      background: '#07090e',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        maxWidth: 1200,
        margin: '0 auto 2rem auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24,
            height: 24,
            background: '#00f2fe',
            borderRadius: '50%',
            boxShadow: '0 0 12px #00f2fe'
          }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>EchoSign</h1>
        </div>

        {/* Top Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onNavigateWorkspace && (
            <button
              onClick={onNavigateWorkspace}
              style={{
                background: 'rgba(0, 242, 254, 0.12)',
                border: '1px solid #00f2fe',
                color: '#00f2fe',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.12)'; }}
            >
              <span>⚡</span> Open Live Workspace
            </button>
          )}

          {persona && onChangePersona && (
            <button
              onClick={onChangePersona}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#8a99ad',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {persona.icon || '🤟'} {persona.title || 'Persona'}
            </button>
          )}
        </div>
      </header>

      {/* 3-Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {/* Left Third: Practice Module */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#8a99ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Left Third</div>
          <div style={{ fontSize: '0.7rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Practice Module</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2, marginBottom: '1rem' }}>Learn and Practice Signs</div>
          <div style={{
            background: 'rgba(18, 22, 33, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '1.25rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.37)'
          }}>
            <div style={{
              border: '1px solid rgba(0, 242, 254, 0.2)',
              borderRadius: 12,
              padding: '1rem',
              position: 'relative',
              marginBottom: '1rem',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <span style={{
                background: 'rgba(0,242,254,0.15)',
                color: '#00f2fe',
                border: '1px solid #00f2fe',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 10,
                float: 'right',
                fontWeight: 700
              }}>
                {currentLesson.tag}
              </span>

              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: '#fff' }}>{currentLesson.title}</h3>
              <p style={{ fontSize: '0.75rem', color: '#8a99ad', width: '65%', lineHeight: 1.4 }}>
                {currentLesson.desc}
              </p>

              <div style={{
                background: 'rgba(0, 230, 118, 0.2)',
                border: '1px solid #00e676',
                color: '#00e676',
                padding: '0.5rem 1rem',
                borderRadius: 8,
                display: 'inline-block',
                fontWeight: 600,
                marginTop: '1rem',
                fontSize: '0.85rem'
              }}>
                Correct! 🎉
              </div>

              <div style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                width: 70,
                height: 70,
                border: '1px solid #8a99ad',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                fontSize: '1.8rem'
              }}>
                {currentLesson.emoji}
              </div>
            </div>

            <button
              onClick={nextLesson}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: 'none',
                background: '#00f2fe',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                boxShadow: '0 0 16px rgba(0,242,254,0.25)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              Next Lesson
            </button>
          </div>
        </div>

        {/* Middle Third: Translator Module */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#8a99ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Middle Third</div>
          <div style={{ fontSize: '0.7rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Translator Module</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2, marginBottom: '1rem' }}>Everyday Translation</div>
          <div style={{
            background: 'rgba(18, 22, 33, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '1.25rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.37)'
          }}>
            {/* Toggle bar */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 20,
              padding: 4,
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {['TEXT', 'SPEECH', 'SIGN'].map((t) => (
                <div
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    padding: '4px 16px',
                    borderRadius: 16,
                    fontSize: '0.8rem',
                    color: activeTab === t ? '#fff' : '#8a99ad',
                    background: activeTab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
                    fontWeight: activeTab === t ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleTranslate(e.target.value);
              }}
              placeholder="Hello"
              style={{
                width: '100%',
                height: 80,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                color: '#fff',
                padding: '0.5rem',
                marginBottom: '1rem',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />

            <div style={{
              background: 'rgba(0,242,254,0.05)',
              border: '1px solid rgba(0,242,254,0.2)',
              borderRadius: 8,
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ color: '#00f2fe', fontSize: '2rem', letterSpacing: 2, margin: 0 }}>
                {translatedResult.output}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#8a99ad', marginTop: 5 }}>
                {translatedResult.speech ? `Audio Speech: ${translatedResult.speech}` : 'Audio Speech: Hello nice to meet you'}
              </p>
            </div>

            <button
              onClick={speakAudio}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: 'none',
                background: '#00f2fe',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                boxShadow: '0 0 16px rgba(0,242,254,0.25)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              🔊 Speak Output Audio
            </button>
          </div>
        </div>

        {/* Right Third: Emergency Module */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#8a99ad', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Right Third</div>
              <div style={{ fontSize: '0.7rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Module</div>
            </div>
            <div style={{
              width: 32,
              height: 32,
              background: 'rgba(255,59,48,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff3b30',
              fontSize: '1rem'
            }}>
              🛡️
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2, marginBottom: '1rem' }}>Accessible Emergency Alerts</div>
          <div style={{
            background: 'rgba(18, 22, 33, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '1.25rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.37)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '0.5rem',
              marginBottom: '1rem'
            }}>
              {EMERGENCY_ALERTS.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                let color = '#ff3b30';
                if (alert.type === 'alert-orange') color = '#ff9500';
                if (alert.type === 'alert-cyan') color = '#00f2fe';
                if (alert.type === 'alert-yellow') color = '#ffcc00';
                if (alert.type === 'alert-purple') color = '#af52de';

                return (
                  <div
                    key={alert.id}
                    onClick={() => triggerAlert(alert)}
                    style={{
                      background: isSelected ? `${color}25` : 'rgba(0,0,0,0.3)',
                      borderRadius: 8,
                      padding: '0.75rem',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: `1px solid ${color}`,
                      color: color,
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? `0 0 12px ${color}40` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${color}20`;
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? `${color}25` : 'rgba(0,0,0,0.3)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {alert.label}
                  </div>
                );
              })}
            </div>

            {broadcastStatus && (
              <div style={{
                fontSize: '0.75rem',
                color: '#ff3b30',
                background: 'rgba(255,59,48,0.1)',
                padding: '6px 10px',
                borderRadius: 6,
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>
                {broadcastStatus}
              </div>
            )}

            <button
              onClick={broadcastCurrentAlert}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #00f2fe',
                background: 'transparent',
                color: '#00f2fe',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,242,254,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Broadcast Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
