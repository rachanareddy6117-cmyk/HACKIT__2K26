import React, { useRef, useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Trophy, Sparkles, Timer, RefreshCw } from 'lucide-react';
import { getRoadmapByCategory } from '../utils/roadmapData';
import CameraView from './CameraView';
import HandTracker from './HandTracker';
import SignIllustration from './SignIllustration';

export default function PracticeModule({ category = 'deaf_mute' }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [moduleIdx, setModuleIdx] = useState(0);
  const [isMatched, setIsMatched] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [activeCategory, setActiveCategory] = useState(category);

  const cameraRef = useRef(null);
  const timerRef = useRef(null);

  const roadmap = getRoadmapByCategory(activeCategory);
  const currentLevel = roadmap[levelIdx] || roadmap[0];
  const currentModule = currentLevel.modules[moduleIdx] || currentLevel.modules[0];

  const isDeaf = activeCategory === 'deaf_mute';

  // Handle successful hand match -> 6-second countdown & auto-advance (5-10s range)
  const handleMatchSuccess = () => {
    if (isMatched) return;
    setIsMatched(true);
    setCountdown(6);

    let timeLeft = 6;
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        advanceToNext();
      }
    }, 1000);
  };

  const advanceToNext = () => {
    setIsMatched(false);
    setCountdown(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (moduleIdx < currentLevel.modules.length - 1) {
      setModuleIdx(prev => prev + 1);
    } else if (levelIdx < roadmap.length - 1) {
      setLevelIdx(prev => prev + 1);
      setModuleIdx(0);
    } else {
      setLevelIdx(0);
      setModuleIdx(0);
    }
  };

  useEffect(() => {
    setIsMatched(false);
    setCountdown(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [levelIdx, moduleIdx, activeCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Header with Category Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: isDeaf ? '#60A5FA' : '#FB923C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            LEFT THIRD • Practice Module
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>Learn and Practice Signs</h2>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.5)', padding: 3, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setActiveCategory('deaf_mute')}
            style={{
              padding: '4px 8px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: isDeaf ? '#2563EB' : 'transparent', color: '#fff'
            }}
          >
            🤟 Deaf
          </button>
          <button
            onClick={() => setActiveCategory('autism_introvert')}
            style={{
              padding: '4px 8px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: !isDeaf ? '#EA580C' : 'transparent', color: '#fff'
            }}
          >
            🧩 Autism
          </button>
        </div>
      </div>

      {/* Main Lesson Card */}
      <div
        style={{
          background: isDeaf ? '#0D1527' : '#1C120C',
          border: isDeaf ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(249,115,22,0.3)',
          borderRadius: 20, padding: 18,
          flex: 1, display: 'flex', flexDirection: 'column', gap: 12,
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Progress header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: isDeaf ? '#93C5FD' : '#FED7AA' }}>
            Level {currentLevel.level} • {currentLevel.title}
          </span>
          <span
            style={{
              fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
              background: isDeaf ? 'rgba(37,99,235,0.2)' : 'rgba(234,88,12,0.2)',
              color: isDeaf ? '#60A5FA' : '#FB923C',
              border: isDeaf ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(249,115,22,0.4)',
            }}
          >
            Lesson {moduleIdx + 1}/5
          </span>
        </div>

        {/* Sign Info with High-Res Sign Picture on the right */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 12, borderRadius: 14,
            background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{currentModule.emoji}</span>
              <span>{currentModule.title}</span>
            </div>
            <div style={{ fontSize: 11, color: isDeaf ? '#93C5FD' : '#FED7AA', fontWeight: 600, marginTop: 2 }}>
              {currentModule.subtitle}
            </div>
            <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 4, lineHeight: 1.4 }}>
              {currentModule.description}
            </div>
          </div>

          {/* SIGN PICTURE ON RIGHT */}
          <div
            style={{
              width: 72, height: 72, borderRadius: 14, flexShrink: 0,
              background: isDeaf ? 'rgba(37,99,235,0.15)' : 'rgba(234,88,12,0.15)',
              border: isDeaf ? '1px solid rgba(96,165,250,0.4)' : '1px solid rgba(251,146,60,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4
            }}
          >
            <SignIllustration
              sign={currentModule.targetSign || 'OPEN_HAND'}
              emoji={currentModule.emoji}
              size={56}
            />
          </div>
        </div>

        {/* Posture Guide */}
        <div style={{ fontSize: 10.5, color: '#E2E8F0', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <strong style={{ color: '#FCD34D' }}>Gesture Guide: </strong>
          {currentModule.instruction}
        </div>

        {/* Mini Camera with Hand Tracking and Dotted Line Overlay */}
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 160, background: '#000' }}>
          <CameraView ref={cameraRef} />
          <HandTracker
            videoElement={cameraRef.current?.getVideoElement()}
            isCameraActive={cameraRef.current?.isCameraActive()}
            targetModule={currentModule}
            onMatchSuccess={handleMatchSuccess}
            themeMode={activeCategory}
          />
        </div>

        {/* Match Feedback / 5s Progress */}
        {isMatched ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 12,
              background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22C55E', fontWeight: 800, fontSize: 13 }}>
              <CheckCircle2 size={16} />
              <span>Correct! 🎉 Match Confirmed</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#86EFAC', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Timer size={13} />
              <span>Next in {countdown}s...</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleMatchSuccess}
              style={{
                flex: 1, padding: '10px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #00F2FE, #9D50BB)',
                color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 0 16px rgba(0,242,254,0.25)'
              }}
            >
              <Sparkles size={14} /> Simulate & Match Sign
            </button>
            <button
              onClick={advanceToNext}
              style={{
                padding: '10px 14px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              Next <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
