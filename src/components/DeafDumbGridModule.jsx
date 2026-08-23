import React, { useState } from 'react';
import {
  Volume2, Sparkles, Hand, Heart, AlertTriangle, ShieldCheck,
  CheckCircle, Play, Eye, RotateCcw, Check, MessageSquare
} from 'lucide-react';
import SignIllustration from './SignIllustration';

const DEAF_CATEGORIES = [
  { id: 'all', label: '🌟 All Symbols' },
  { id: 'daily', label: '💬 Daily & Social' },
  { id: 'needs', label: '🍽️ Needs & Comfort' },
  { id: 'emergency', label: '🚨 Emergency & Safety' },
  { id: 'alphabet', label: '🔤 Alphabet (A-Z)' },
  { id: 'numbers', label: '🔢 Numbers (0-9)' }
];

const DEAF_SYMBOLS = [
  // Daily & Social
  { id: 'hello', category: 'daily', title: 'Hello / Greeting', emoji: '👋', sign: 'HELLO', speech: 'Hello! Nice to meet you.', color: '#00f2fe', desc: 'Open hand wave beside face' },
  { id: 'thankyou', category: 'daily', title: 'Thank You', emoji: '🙏', sign: 'THANK_YOU', speech: 'Thank you very much for your help.', color: '#10b981', desc: 'Flat hand touches chin and moves forward' },
  { id: 'yes', category: 'daily', title: 'Yes / Agree', emoji: '👍', sign: 'YES', speech: 'Yes, I agree.', color: '#22c55e', desc: 'Fist nods up and down' },
  { id: 'no', category: 'daily', title: 'No / Disagree', emoji: '👎', sign: 'NO', speech: 'No, I disagree.', color: '#ef4444', desc: 'Index and middle fingers tap thumb' },
  { id: 'please', category: 'daily', title: 'Please', emoji: '🤲', sign: 'PLEASE', speech: 'Please, I would appreciate that.', color: '#a78bfa', desc: 'Flat hand rubs circular motion over chest' },
  { id: 'ily', category: 'daily', title: 'I Love You', emoji: '🤟', sign: 'ILY', speech: 'I love and care about you.', color: '#ec4899', desc: 'Thumb, index, and pinky extended (ILY sign)' },
  { id: 'friend', category: 'daily', title: 'Friend', emoji: '🤝', sign: 'FRIEND', speech: 'You are my good friend.', color: '#38bdf8', desc: 'Interlocking index fingers' },
  { id: 'good', category: 'daily', title: 'Good / Fine', emoji: '👌', sign: 'OK', speech: 'Everything is good and fine.', color: '#f59e0b', desc: 'Thumb and index form circle (OK)' },

  // Needs & Comfort
  { id: 'water', category: 'needs', title: 'Need Water', emoji: '💧', sign: 'WATER', speech: 'Please, I need a glass of drinking water.', color: '#00f2fe', desc: 'W-hand index/middle/ring tap chin' },
  { id: 'food', category: 'needs', title: 'Need Food / Hungry', emoji: '🍎', sign: 'FOOD', speech: 'I am hungry and need something to eat.', color: '#f97316', desc: 'Squished fingers tap mouth repeatedly' },
  { id: 'restroom', category: 'needs', title: 'Restroom / Washroom', emoji: '🚻', sign: 'RESTROOM', speech: 'Where is the restroom, please?', color: '#8b5cf6', desc: 'T-hand shakes gently side to side' },
  { id: 'sleep', category: 'needs', title: 'Tired / Sleep', emoji: '🛏️', sign: 'SLEEP', speech: 'I am exhausted and need to rest.', color: '#64748b', desc: 'Open hand pulls down face into closed fist' },
  { id: 'medicine', category: 'needs', title: 'Medicine / Pain Relief', emoji: '💊', sign: 'MEDICINE', speech: 'I need to take my medicine.', color: '#ef4444', desc: 'Middle finger stirs open palm' },
  { id: 'help_need', category: 'needs', title: 'Help Me', emoji: '🙋', sign: 'HELP', speech: 'Can you please assist me with this?', color: '#06b6d4', desc: 'Thumbs-up fist rests on flat palm and lifts' },

  // Emergency & Safety
  { id: 'sos', category: 'emergency', title: 'SOS Emergency Help', emoji: '🆘', sign: 'EMERGENCY', speech: 'Emergency! I need immediate help right now!', color: '#ff3b30', desc: 'Urgent open wave with alert posture' },
  { id: 'doctor', category: 'emergency', title: 'Need a Doctor', emoji: '🏥', sign: 'DOCTOR', speech: 'Please call a doctor or medical emergency team.', color: '#f97316', desc: 'M-fingers tap inner wrist pulse' },
  { id: 'security', category: 'emergency', title: 'Call Security / Police', emoji: '🚨', sign: 'SECURITY', speech: 'Please contact security or police immediately.', color: '#eab308', desc: 'C-hand taps opposite shoulder like badge' },
  { id: 'lost', category: 'emergency', title: 'I Am Lost', emoji: '📍', sign: 'LOST', speech: 'I am lost. Can you help me find my way?', color: '#af52de', desc: 'Fingertips touch and drop apart down' },
  { id: 'pain', category: 'emergency', title: 'I Am In Severe Pain', emoji: '❤️‍🩹', sign: 'PAIN', speech: 'I am feeling severe physical pain.', color: '#ff3b30', desc: 'Both index fingers twist toward each other' },
  { id: 'stop_danger', category: 'emergency', title: 'Stop / Danger', emoji: '🛑', sign: 'STOP', speech: 'Stop! That is dangerous.', color: '#ef4444', desc: 'Flat hand chops down onto flat palm' },

  // Alphabet (A-Z)
  { id: 'alpha_a', category: 'alphabet', title: 'Letter A', emoji: '✊', sign: 'A', speech: 'Letter A in Sign Language.', color: '#00f2fe', desc: 'Closed fist with thumb upright against side' },
  { id: 'alpha_b', category: 'alphabet', title: 'Letter B', emoji: '✋', sign: 'B', speech: 'Letter B in Sign Language.', color: '#00f2fe', desc: 'Four fingers up, thumb folded across palm' },
  { id: 'alpha_c', category: 'alphabet', title: 'Letter C', emoji: '🤏', sign: 'C', speech: 'Letter C in Sign Language.', color: '#00f2fe', desc: 'Hand curved in C shape' },
  { id: 'alpha_d', category: 'alphabet', title: 'Letter D', emoji: '☝️', sign: 'D', speech: 'Letter D in Sign Language.', color: '#00f2fe', desc: 'Index pointing up, other fingers form circle with thumb' },
  { id: 'alpha_f', category: 'alphabet', title: 'Letter F', emoji: '👌', sign: 'F', speech: 'Letter F in Sign Language.', color: '#00f2fe', desc: 'Index and thumb touching, 3 fingers up' },
  { id: 'alpha_l', category: 'alphabet', title: 'Letter L', emoji: '👆', sign: 'L', speech: 'Letter L in Sign Language.', color: '#00f2fe', desc: 'Index and thumb extended at 90 degrees' },
  { id: 'alpha_v', category: 'alphabet', title: 'Letter V', emoji: '✌️', sign: 'V', speech: 'Letter V in Sign Language.', color: '#00f2fe', desc: 'Index and middle fingers spread in V' },
  { id: 'alpha_y', category: 'alphabet', title: 'Letter Y', emoji: '🤙', sign: 'Y', speech: 'Letter Y in Sign Language.', color: '#00f2fe', desc: 'Thumb and pinky extended (shaka sign)' },

  // Numbers (0-9)
  { id: 'num_1', category: 'numbers', title: 'Number 1', emoji: '☝️', sign: '1', speech: 'Number one in Sign Language.', color: '#38bdf8', desc: 'Index finger pointing straight up' },
  { id: 'num_2', category: 'numbers', title: 'Number 2', emoji: '✌️', sign: '2', speech: 'Number two in Sign Language.', color: '#38bdf8', desc: 'Index and middle fingers raised' },
  { id: 'num_3', category: 'numbers', title: 'Number 3', emoji: '🤟', sign: '3', speech: 'Number three in Sign Language.', color: '#38bdf8', desc: 'Thumb, index, and middle raised (ASL 3)' },
  { id: 'num_4', category: 'numbers', title: 'Number 4', emoji: '🖖', sign: '4', speech: 'Number four in Sign Language.', color: '#38bdf8', desc: 'Four fingers up, thumb folded' },
  { id: 'num_5', category: 'numbers', title: 'Number 5', emoji: '🖐️', sign: '5', speech: 'Number five in Sign Language.', color: '#38bdf8', desc: 'All five fingers spread open' },
  { id: 'num_10', category: 'numbers', title: 'Number 10', emoji: '👍', sign: '10', speech: 'Number ten in Sign Language.', color: '#38bdf8', desc: 'Thumb wiggles upright' }
];

export default function DeafDumbGridModule({ onSelectSign }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lastSpoken, setLastSpoken] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  const filteredSymbols = activeCategory === 'all'
    ? DEAF_SYMBOLS
    : DEAF_SYMBOLS.filter(s => s.category === activeCategory);

  const handleSpeak = (sym) => {
    setSelectedCard(sym);
    setLastSpoken(sym.speech);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(sym.speech);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
    if (onSelectSign) {
      onSelectSign(sym);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      color: '#fff',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
    }}>
      {/* Module Title & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            DEAF & NON-SPEAKING COMMUNICATION GRID
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>
            Symbol-Based Expression & Tap-to-Speak Grid
          </h2>
        </div>

        {lastSpoken && (
          <div style={{
            background: 'rgba(0, 242, 254, 0.12)',
            border: '1px solid #00f2fe',
            borderRadius: 16,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#00f2fe',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 0 16px rgba(0, 242, 254, 0.25)'
          }}>
            <Volume2 size={15} />
            <span>Vocalized: "{lastSpoken}"</span>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {DEAF_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeCategory === cat.id ? '#00f2fe' : 'rgba(255, 255, 255, 0.1)'}`,
              color: activeCategory === cat.id ? '#00f2fe' : '#8a99ad',
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

      {/* ── SYMBOL GRID LAYOUT ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: 16
      }}>
        {filteredSymbols.map(sym => {
          const isSelected = selectedCard?.id === sym.id;
          return (
            <div
              key={sym.id}
              onClick={() => handleSpeak(sym)}
              style={{
                background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(18, 22, 33, 0.75)',
                border: `1px solid ${isSelected ? sym.color : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: 16,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                boxShadow: isSelected ? `0 0 24px ${sym.color}35` : '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = sym.color;
                e.currentTarget.style.boxShadow = `0 0 20px ${sym.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = isSelected ? sym.color : 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = isSelected ? `0 0 24px ${sym.color}35` : '0 4px 20px rgba(0,0,0,0.3)';
              }}
            >
              {/* Top Row: Symbol Icon & Vocalize Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  fontSize: 34,
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${sym.color}15`,
                  border: `1px solid ${sym.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 14px ${sym.color}25`
                }}>
                  {sym.emoji}
                </div>

                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: sym.color
                }}>
                  <Volume2 size={16} />
                </div>
              </div>

              {/* Title & Gesture description */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                  {sym.title}
                </div>
                <div style={{ fontSize: 11, color: '#8a99ad', lineHeight: 1.3 }}>
                  {sym.desc}
                </div>
              </div>

              {/* Bottom Tag */}
              <div style={{
                marginTop: 'auto',
                paddingTop: 8,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: sym.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🤟 SIGN: {sym.sign}
                </span>

                <span style={{ fontSize: 10, color: '#8a99ad' }}>
                  Tap to Speak 🔊
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
