import React, { useState, useEffect } from 'react';
import {
  Sparkles, Volume2, ShieldCheck, Heart, RefreshCw, Eye, Smile,
  AlertCircle, Compass, Zap, Music, Coffee, Moon, Headphones,
  Sun, UserCheck, MessageSquare, Hand, Check
} from 'lucide-react';

const EMOTION_STATES = [
  { id: 'calm', label: 'Calm & Grounded', emoji: '😌', color: '#10b981', desc: 'Heart rate steady, low sensory stress', suggestion: 'Great state for learning or casual conversation.' },
  { id: 'happy', label: 'Happy & Engaged', emoji: '😊', color: '#00f2fe', desc: 'Positive emotional resonance', suggestion: 'Ready for interactive practice and peer connection!' },
  { id: 'overwhelmed', label: 'Sensory Overload', emoji: '😵', color: '#ef4444', desc: 'High visual/auditory stimulus detected', suggestion: 'Recommend 3-minute Gyana Mudra or dark quiet mode.' },
  { id: 'anxious', label: 'Anxious / Hesitant', emoji: '😰', color: '#f59e0b', desc: 'Rapid movements, tension around face/hands', suggestion: 'Try 4-7-8 breathing exercise or tap "I Need Space".' },
  { id: 'thinking', label: 'Deep Focus / Processing', emoji: '🤔', color: '#9d50bb', desc: 'High cognitive absorption', suggestion: 'Take your time before responding. No pressure.' },
  { id: 'tired', label: 'Fatigue / Rest Needed', emoji: '😴', color: '#64748b', desc: 'Lower eye engagement, slowed posture', suggestion: 'Switch to low-energy listening mode.' },
];

const AAC_CATEGORIES = [
  { id: 'all', label: '🧩 All AAC Symbols' },
  { id: 'needs', label: '🟢 Basic Needs' },
  { id: 'feelings', label: '🟣 Emotional Feelings' },
  { id: 'comfort', label: '🔵 Sensory & Comfort' },
  { id: 'social', label: '🟡 Social Communication' },
];

const AAC_CARDS = [
  // Basic Needs
  { id: 'water', category: 'needs', label: 'Drink Water', emoji: '💧', speech: 'I would like a glass of drinking water.', color: '#00f2fe', sign: 'WATER' },
  { id: 'hungry', category: 'needs', label: 'Need Food', emoji: '🍎', speech: 'I am hungry and need something to eat.', color: '#f97316', sign: 'FOOD' },
  { id: 'restroom', category: 'needs', label: 'Use Restroom', emoji: '🚻', speech: 'I need to use the restroom, please.', color: '#8b5cf6', sign: 'RESTROOM' },
  { id: 'sleep', category: 'needs', label: 'Rest / Sleep', emoji: '🛏️', speech: 'I am feeling tired and need to rest.', color: '#64748b', sign: 'SLEEP' },
  { id: 'medicine', category: 'needs', label: 'Take Medicine', emoji: '💊', speech: 'I need to take my medication.', color: '#ef4444', sign: 'MEDICINE' },
  { id: 'clothes', category: 'needs', label: 'Too Hot / Cold', emoji: '🧥', speech: 'The temperature is uncomfortable for me.', color: '#06b6d4', sign: 'COMFORT' },

  // Emotional Feelings
  { id: 'calm_feel', category: 'feelings', label: 'Feeling Calm', emoji: '😌', speech: 'I am feeling calm and peaceful.', color: '#10b981', sign: 'CALM' },
  { id: 'happy_feel', category: 'feelings', label: 'Feeling Happy', emoji: '😊', speech: 'I am happy and having a good time.', color: '#00f2fe', sign: 'HAPPY' },
  { id: 'overloaded', category: 'feelings', label: 'Sensory Overload', emoji: '😵', speech: 'I am experiencing sensory overload from too much sound or light.', color: '#ef4444', sign: 'OVERLOAD' },
  { id: 'anxious_feel', category: 'feelings', label: 'Feeling Anxious', emoji: '😰', speech: 'I am feeling nervous and anxious right now.', color: '#f59e0b', sign: 'ANXIOUS' },
  { id: 'frustrated', category: 'feelings', label: 'Frustrated', emoji: '😤', speech: 'I am feeling frustrated with this situation.', color: '#ec4899', sign: 'FRUSTRATED' },
  { id: 'tired_feel', category: 'feelings', label: 'Very Tired', emoji: '😴', speech: 'My energy is low, I need some rest.', color: '#64748b', sign: 'TIRED' },

  // Sensory & Comfort Actions
  { id: 'headphones', category: 'comfort', label: 'Noise Headphones', emoji: '🎧', speech: 'Please pass my noise-cancelling headphones.', color: '#a78bfa', sign: 'HEADPHONES' },
  { id: 'dim_lights', category: 'comfort', label: 'Dim the Lights', emoji: '💡', speech: 'The lighting is too bright. Please dim the lights.', color: '#eab308', sign: 'DIM_LIGHTS' },
  { id: 'fidget', category: 'comfort', label: 'Fidget Toy', emoji: '🧸', speech: 'I need my sensory fidget toy to help me focus.', color: '#38bdf8', sign: 'FIDGET' },
  { id: 'walk', category: 'comfort', label: 'Walk Outside', emoji: '🚶', speech: 'Can we go for a walk outside in fresh air?', color: '#10b981', sign: 'WALK' },
  { id: 'quiet_time', category: 'comfort', label: 'Quiet Time / Break', emoji: '🤫', speech: 'I need 5 minutes of quiet time to regulate.', color: '#6366f1', sign: 'QUIET' },
  { id: 'hug', category: 'comfort', label: 'Deep Pressure Hug', emoji: '🫂', speech: 'I would like a deep pressure hug or weighted blanket.', color: '#ec4899', sign: 'HUG' },

  // Social Communication
  { id: 'hello_soc', category: 'social', label: 'Hello / Greeting', emoji: '👋', speech: 'Hello! Nice to see you today.', color: '#00f2fe', sign: 'HELLO' },
  { id: 'bye_soc', category: 'social', label: 'Goodbye', emoji: '🙋', speech: 'Goodbye, see you again soon!', color: '#9d50bb', sign: 'GOODBYE' },
  { id: 'please_soc', category: 'social', label: 'Please / Thank You', emoji: '🙏', speech: 'Please and thank you very much.', color: '#10b981', sign: 'THANK_YOU' },
  { id: 'space_soc', category: 'social', label: 'I Need Space', emoji: '🛑', speech: 'I need a few minutes of quiet personal space, please.', color: '#ef4444', sign: 'SPACE' },
  { id: 'play_together', category: 'social', label: 'Join Activity', emoji: '🤝', speech: 'Can we do this activity or game together?', color: '#38bdf8', sign: 'TOGETHER' },
  { id: 'repeat_soc', category: 'social', label: 'Please Repeat', emoji: '🔄', speech: 'Could you please explain that again more slowly?', color: '#f59e0b', sign: 'REPEAT' }
];

export default function AutismSupportModule() {
  const [currentEmotionIdx, setCurrentEmotionIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSpeech, setActiveSpeech] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(null);

  const currentEmotion = EMOTION_STATES[currentEmotionIdx];

  // Periodic simulated facial/sensory scanning
  useEffect(() => {
    const timer = setInterval(() => {
      if (isScanning) {
        setCurrentEmotionIdx((prev) => (prev + 1) % EMOTION_STATES.length);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [isScanning]);

  const speakText = (card) => {
    setSelectedCardId(card.id);
    setActiveSpeech(card.speech);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(card.speech);
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  };

  const filteredCards = selectedCategory === 'all'
    ? AAC_CARDS
    : AAC_CARDS.filter(c => c.category === selectedCategory);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      color: '#fff',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            AUTISM & SENSORY AAC ASSISTANT
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>
            Visual AAC Grid & Facial Expression Radar
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

      {/* Top Split: Live Expression Radar + Comfort Action */}
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
                borderRadius: 18,
                background: `${currentEmotion.color}20`,
                border: `1px solid ${currentEmotion.color}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 24px ${currentEmotion.color}30`
              }}>
                {currentEmotion.emoji}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>
                  {currentEmotion.label}
                </h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0 0' }}>
                  {currentEmotion.desc}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 12,
            padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 12,
            color: currentEmotion.color
          }}>
            💡 Recommendation: {currentEmotion.suggestion}
          </div>
        </div>

        {/* Right: Active Vocalizer Banner */}
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
            <div style={{ fontSize: 11, fontWeight: 800, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TAP-TO-VOCALIZE SPEECH ENGINE
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '6px 0 10px 0' }}>
              Instant AAC Audio Output
            </h3>
            <p style={{ fontSize: 12, color: '#8a99ad', margin: 0 }}>
              Tap any symbol card below to speak clearly and display accessibility sign gestures.
            </p>
          </div>

          <div style={{
            background: activeSpeech ? 'rgba(0, 242, 254, 0.12)' : 'rgba(0,0,0,0.2)',
            border: activeSpeech ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '12px 16px',
            color: activeSpeech ? '#00f2fe' : '#64748b',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <Volume2 size={20} />
            <span>{activeSpeech ? `"${activeSpeech}"` : 'Select any symbol to trigger audio speech...'}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {AAC_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              background: selectedCategory === cat.id ? 'rgba(157, 80, 187, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${selectedCategory === cat.id ? '#a78bfa' : 'rgba(255, 255, 255, 0.1)'}`,
              color: selectedCategory === cat.id ? '#a78bfa' : '#8a99ad',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── AAC SYMBOL GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 14
      }}>
        {filteredCards.map(card => {
          const isSelected = selectedCardId === card.id;
          return (
            <div
              key={card.id}
              onClick={() => speakText(card)}
              style={{
                background: isSelected ? 'rgba(157, 80, 187, 0.25)' : 'rgba(18, 22, 33, 0.75)',
                border: `1px solid ${isSelected ? card.color : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: 16,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 10,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                boxShadow: isSelected ? `0 0 24px ${card.color}40` : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = card.color;
                e.currentTarget.style.boxShadow = `0 0 20px ${card.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = isSelected ? card.color : 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = isSelected ? `0 0 24px ${card.color}40` : '0 4px 16px rgba(0,0,0,0.3)';
              }}
            >
              {/* Symbol */}
              <div style={{
                fontSize: 38,
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `${card.color}15`,
                border: `1px solid ${card.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 16px ${card.color}20`
              }}>
                {card.emoji}
              </div>

              {/* Label */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 10, color: '#8a99ad', marginTop: 2 }}>
                  🤟 {card.sign}
                </div>
              </div>

              {/* Tap Indicator */}
              <div style={{
                marginTop: 'auto',
                fontSize: 10,
                fontWeight: 700,
                color: card.color,
                background: `${card.color}10`,
                padding: '3px 8px',
                borderRadius: 8
              }}>
                🔊 Tap to Speak
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
