import React, { useRef, useState } from 'react';
import { PRACTICE_LESSONS } from '../utils/gestureData';
import CameraView from './CameraView';
import HandTracker from './HandTracker';
import { CheckCircle2, ArrowRight, Trophy } from 'lucide-react';

export default function Practice() {
  const [idx,        setIdx]       = useState(0);
  const [practicing, setPracticing]= useState(false);
  const [status,     setStatus]    = useState('idle');
  const cameraRef = useRef(null);

  const lesson = PRACTICE_LESSONS[idx];

  const handleGesture = (g) => {
    if (!practicing) return;
    if (g.sign === lesson.targetSign) {
      setStatus('success');
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance('Correct!'));
    } else {
      setStatus('incorrect');
    }
  };

  const next = () => {
    setStatus('idle');
    setIdx(i => (i + 1) % PRACTICE_LESSONS.length);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Learn & Practice Signs</h1>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
          Perform the target gesture in front of your camera for instant AI feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Lesson Card */}
        <div
          className="lg:col-span-5 p-6 rounded-3xl space-y-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.2)', color: '#00F2FE' }}
            >
              Lesson {idx + 1} / {PRACTICE_LESSONS.length}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#94A3B8' }}>
              <Trophy className="w-4 h-4" style={{ color: '#f59e0b' }} />
              Progress: {idx + 1}/{PRACTICE_LESSONS.length}
            </div>
          </div>

          <div
            className="text-center p-6 rounded-2xl space-y-3"
            style={{ background: '#05070A', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="text-5xl">{lesson.emoji}</div>
            <h2 className="text-xl font-black text-white">{lesson.title}</h2>
            <p className="text-xs" style={{ color: '#94A3B8' }}>{lesson.instruction}</p>
            <div
              className="inline-block text-[11px] font-bold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(157,80,187,0.08)', border: '1px solid rgba(157,80,187,0.2)', color: '#9D50BB' }}
            >
              Hint: {lesson.hint}
            </div>
          </div>

          {status === 'success' && (
            <div
              className="p-4 rounded-2xl text-center space-y-1 animate-fade-in-up"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <CheckCircle2 className="w-8 h-8 mx-auto" style={{ color: '#10b981' }} />
              <div className="text-lg font-black text-white">Correct! 🎉</div>
              <div className="text-xs" style={{ color: '#94A3B8' }}>Great job mastering this gesture.</div>
            </div>
          )}

          {status === 'incorrect' && (
            <div
              className="p-3 rounded-xl text-center text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d' }}
            >
              Try again. Match the target pose shown above.
            </div>
          )}

          <div className="space-y-2">
            {!practicing ? (
              <button
                onClick={() => { setPracticing(true); setStatus('idle'); }}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg,#00F2FE,#9D50BB)', color: '#fff', boxShadow: '0 0 24px rgba(0,242,254,0.2)' }}
              >
                Start Practice
              </button>
            ) : (
              <button
                onClick={next}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.25)', color: '#00F2FE' }}
              >
                Next Lesson <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Camera + Hand Tracker */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden" style={{ height: 420 }}>
          <CameraView ref={cameraRef} />
          <HandTracker
            videoElement={cameraRef.current?.getVideoElement()}
            isCameraActive={cameraRef.current?.isCameraActive()}
            onGestureDetected={handleGesture}
          />
        </div>

      </div>
    </div>
  );
}
