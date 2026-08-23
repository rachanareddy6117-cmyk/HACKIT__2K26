import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, ShieldCheck, Heart, RefreshCw, Eye, Smile, AlertCircle, Compass, Zap, Music, Coffee, Moon } from 'lucide-react';
import CameraView from './CameraView';

const EMOTION_STATES = [
  { id: 'calm', label: 'Calm & Grounded', emoji: '😌', color: '#10b981', desc: 'Heart rate steady, low sensory stress', suggestion: 'Great state for learning or casual conversation.' },
  { id: 'happy', label: 'Happy & Engaged', emoji: '😊', color: '#00f2fe', desc: 'Positive emotional resonance', suggestion: 'Ready for interactive practice and peer connection!' },
  { id: 'overwhelmed', label: 'Sensory Overload', emoji: '😵', color: '#ef4444', desc: 'High visual/auditory stimulus detected', suggestion: 'Recommend 3-minute Gyana Mudra or dark quiet mode.' },
  { id: 'anxious', label: 'Anxious / Hesitant', emoji: '😰', color: '#f59e0b', desc: 'Rapid movements, tension around face/hands', suggestion: 'Try 4-7-8 breathing exercise or tap "I Need Space".' },
  { id: 'thinking', label: 'Deep Focus / Processing', emoji: '🤔', color: '#9d50bb', desc: 'High cognitive absorption', suggestion: 'Take your time before responding. No pressure.' },
  { id: 'tired', label: 'Fatigue / Rest Needed', emoji: '😴', color: '#64748b', desc: 'Lower eye engagement, slowed posture', suggestion: 'Switch to low-energy listening mode.' },
];

const AAC_CARDS = [
  { id: 'space', label: 'I Need Space', emoji: '🛑', speech: 'I need a few minutes of quiet personal space, please.', color: '#ef4444' },
  { id: 'water', label: 'Drink Water', emoji: '💧', speech: 'I would like a glass of drinking water.', color: '#00f2fe' },
  { id: 'break', label: 'Take a Break', emoji: '⏸️', speech: 'Let us take a short break right now.', color: '#f59e0b' },
  { id: 'calm', label: 'Calm Breathing', emoji: '🧘', speech: 'Practicing calm meditation breathing to center my thoughts.', color: '#10b981' },
  { id: 'hungry', label: 'Need Food', emoji: '🍽️', speech: 'I am hungry and need something to eat.', color: '#ec4899' },
  { id: 'happy', label: 'Feeling Good', emoji: '😊', speech: 'I am feeling good and ready to proceed.', color: '#38bdf8' },
  { id: 'music', label: 'Play Music', emoji: '🎵', speech: 'Can we listen to soothing background music?', color: '#9d50bb' },
  { id: 'yes', label: 'Yes / Agree', emoji: '👍', speech: 'Yes, I agree with this.', color: '#22c55e' },
  { id: 'no', label: 'No / Disagree', emoji: '👎', speech: 'No, I do not want this.', color: '#ef4444' },
  { id: 'repeat', label: 'Please Repeat', emoji: '🔄', speech: 'Could you please repeat that more slowly?', color: '#a78bfa' },
  { id: 'help', label: 'Need Support', emoji: '🤝', speech: 'I need a little help with this task.', color: '#f97316' },
  { id: 'sleep', label: 'Rest / Sleep', emoji: '😴', speech: 'I am feeling tired and need to rest.', color: '#64748b' },
];

export default function AutismSupportModule() {
  const [currentEmotionIdx, setCurrentEmotionIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [activeSpeech, setActiveSpeech] = useState('');
  const [soundActive, setSoundActive] = useState(false);

  const currentEmotion = EMOTION_STATES[currentEmotionIdx];

  // Periodic simulated emotion scanner reading facial cues
  useEffect(() => {
    const timer = setInterval(() => {
      if (isScanning) {
        setCurrentEmotionIdx((prev) => (prev + 1) % EMOTION_STATES.length);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [isScanning]);

  const speakText = (text) => {
    setActiveSpeech(text);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const handleCardClick = (card) => {
    speakText(card.speech);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      color: '#fff',
      fontFamily: 'inherit'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            AUTISM & INTROVERT SENSORY ASSISTANT
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>
            Expression Recognition & Visual Action Board
          </h1>
        </div>

        <button
          onClick={() => setIsScanning(!isScanning)}
          style={{
            background: isScanning ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isScanning ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
            color: isScanning ? '#00f2fe' : '#94a3b8',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
          <span>{isScanning ? 'Expression Scanner Live' : 'Scanner Paused'}</span>
        </button>
      </div>

      {/* Top Split: Live Expression Radar + Suggestions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        {/* Left: Emotion State Card */}
        <div style={{
          background: 'rgba(18, 22, 33, 0.75)',
          border: `1px solid ${currentEmotion.color}40`,
          borderRadius: 20,
          padding: 20,
          backdropFilter: 'blur(16px)',
          boxShadow: `0 8px 32px ${currentEmotion.color}15`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                background: `${currentEmotion.color}20`,
                border: `1px solid ${currentEmotion.color}60`,
                color: currentEmotion.color,
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 800
              }}>
                DETECTED EXPRESSION
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Confidence: 96%</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0' }}>
              <div style={{
                fontSize: 48,
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${currentEmotion.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${currentEmotion.color}30`
              }}>
                {currentEmotion.emoji}
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>
                  {currentEmotion.label}
                </h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {currentEmotion.desc}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '12px 14px',
            marginTop: 14
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} />
              <span>Sensory Comfort Recommendation:</span>
            </div>
            <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.4 }}>
              {currentEmotion.suggestion}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Speech Box */}
        <div style={{
          background: 'rgba(18, 22, 33, 0.75)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: 20,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#00f2fe', textTransform: 'uppercase', marginBottom: 8 }}>
              ACTIVE VOCALIZATION OUTPUT
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(0,242,254,0.25)',
              borderRadius: 14,
              padding: 16,
              minHeight: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: 15,
              fontWeight: 700,
              color: '#00f2fe'
            }}>
              {activeSpeech ? `"${activeSpeech}"` : 'Tap any action symbol card below to speak out loud'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              onClick={() => speakText("I am calm and ready.")}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg,#00f2fe,#9d50bb)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Volume2 size={16} /> Speak Affirmation
            </button>
            <button
              onClick={() => {
                speakText("I need three minutes of calm breathing.");
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #ef4444',
                background: 'rgba(239,68,68,0.15)',
                color: '#ef4444',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🛑 Prompt Space
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Visual AAC Communication Symbol Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>
            Visual Expression & Needs Cards (AAC Tap-to-Speak)
          </h3>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>12 Everyday Action Symbols</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: 12
        }}>
          {AAC_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                background: 'rgba(18, 22, 33, 0.75)',
                border: `1px solid ${card.color}35`,
                borderRadius: 16,
                padding: 16,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}30`;
                e.currentTarget.style.background = `${card.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(18, 22, 33, 0.75)';
              }}
            >
              <div style={{ fontSize: 32, lineHeight: 1 }}>{card.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{card.label}</div>
              <div style={{ fontSize: 10, color: '#8a99ad', lineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Tap to vocalize
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
