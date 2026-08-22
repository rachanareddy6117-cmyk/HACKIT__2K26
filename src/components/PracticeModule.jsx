import React, { useRef, useState } from 'react';
import { CheckCircle2, ArrowRight, Trophy } from 'lucide-react';
import { PRACTICE_LESSONS } from '../utils/gestureData';
import CameraView from './CameraView';
import HandTracker from './HandTracker';

export default function PracticeModule() {
  const [idx,      setIdx]       = useState(0);
  const [active,   setActive]    = useState(false);
  const [status,   setStatus]    = useState('idle'); // idle | correct | wrong
  const cameraRef = useRef(null);
  const lesson = PRACTICE_LESSONS[idx];

  const handleGesture = (g) => {
    if (!active) return;
    if (g.sign === lesson.targetSign) {
      setStatus('correct');
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance('Correct!'));
    } else {
      setStatus('wrong');
    }
  };

  const next = () => {
    setStatus('idle');
    setActive(false);
    setIdx(i => (i + 1) % PRACTICE_LESSONS.length);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18, height:'100%' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>
          Practice Module
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#fff' }}>Learn and Practice Signs</h2>
      </div>

      {/* Lesson card */}
      <div style={{
        background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:20, padding:20,
        backdropFilter:'blur(20px)',
        flex:1, display:'flex', flexDirection:'column', gap:14,
      }}>
        {/* Progress badge */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <Trophy size={13} color="#f59e0b"/>
            <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>
              Lesson {idx+1}/{PRACTICE_LESSONS.length}
            </span>
          </div>
          <span style={{
            fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:20,
            background:'rgba(0,229,255,0.1)', color:'#00e5ff',
            border:'1px solid rgba(0,229,255,0.25)',
          }}>Lesson {idx+1}/5</span>
        </div>

        {/* Sign info */}
        <div style={{ textAlign:'center', padding:'8px 0' }}>
          <div style={{ fontSize:40, marginBottom:8 }}>{lesson.emoji}</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{lesson.title}</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>{lesson.instruction}</div>
        </div>

        {/* Mini camera */}
        <div style={{ position:'relative', borderRadius:14, overflow:'hidden', height:120 }}>
          <CameraView ref={cameraRef} compact />
          <HandTracker
            videoElement={cameraRef.current?.getVideoElement()}
            isCameraActive={cameraRef.current?.isCameraActive()}
            onGestureDetected={handleGesture}
          />
        </div>

        {/* Feedback */}
        {status === 'correct' && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'10px 16px', borderRadius:12,
            background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)',
          }}>
            <CheckCircle2 size={16} color="#22c55e"/>
            <span style={{ fontWeight:800, color:'#22c55e', fontSize:15 }}>Correct! 🎉</span>
          </div>
        )}
        {status === 'wrong' && (
          <div style={{
            padding:'8px 14px', borderRadius:12, textAlign:'center',
            background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)',
            fontSize:12, fontWeight:600, color:'#fcd34d',
          }}>Try again — match the target gesture</div>
        )}

        {/* CTAs */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {!active ? (
            <button onClick={() => { setActive(true); setStatus('idle'); }} style={{
              background:'linear-gradient(135deg,#00e5ff,#9d50bb)',
              color:'#fff', border:'none', cursor:'pointer',
              padding:'11px', borderRadius:12, fontWeight:700, fontSize:13,
              boxShadow:'0 0 20px rgba(0,229,255,0.2)',
            }}>Start Practice</button>
          ) : (
            <button onClick={next} style={{
              background:'rgba(0,229,255,0.1)',
              border:'1px solid rgba(0,229,255,0.3)',
              color:'#00e5ff', cursor:'pointer',
              padding:'11px', borderRadius:12, fontWeight:700, fontSize:13,
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              Next Lesson <ArrowRight size={14}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
