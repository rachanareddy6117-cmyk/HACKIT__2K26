import React, { useRef, useState } from 'react';
import CameraView from './CameraView';
import HandTracker from './HandTracker';

/** Sign detection panel — matches screenshot 3 center */
export default function SignDetection({ onGestureDetected }) {
  const cameraRef = useRef(null);
  const [lastGesture, setLastGesture] = useState(null);
  const [handCount,   setHandCount]   = useState(0);

  const handleGesture = (g) => {
    setLastGesture(g);
    onGestureDetected?.(g);
  };

  return (
    <div style={{
      display:'flex', flexDirection:'column', gap:0,
      background:'rgba(255,255,255,0.03)',
      border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:20, overflow:'hidden', height:'100%',
    }}>
      {/* Header bar */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 16px',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        fontSize:13, fontWeight:700,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, color:'#00e5ff' }}>
          <span className="anim-blink" style={{
            width:9, height:9, borderRadius:'50%', display:'inline-block',
            background:'#00e5ff', boxShadow:'0 0 8px #00e5ff',
          }}/>
          LIVE
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, color:'#94a3b8', fontSize:12 }}>
          <span>✋</span>
          <span>{handCount} hand{handCount !== 1 ? 's' : ''} detected</span>
        </div>
      </div>

      {/* Camera + Tracker */}
      <div style={{ position:'relative', flex:1, minHeight:280 }}>
        <CameraView ref={cameraRef}/>
        <HandTracker
          videoElement={cameraRef.current?.getVideoElement()}
          isCameraActive={cameraRef.current?.isCameraActive()}
          onGestureDetected={handleGesture}
        />

        {/* Detected sign overlay — matches screenshot 3 */}
        {lastGesture && (
          <div className="anim-fadeup" style={{
            position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)',
            background:'rgba(0,0,0,0.82)',
            border:'1px solid rgba(0,229,255,0.45)',
            borderRadius:16, padding:'10px 24px',
            backdropFilter:'blur(14px)',
            textAlign:'center', zIndex:20, whiteSpace:'nowrap',
            boxShadow:'0 0 32px rgba(0,229,255,0.18)',
          }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', marginBottom:2 }}>
              Detected Sign:{' '}
              <span style={{ color:'#00e5ff', fontWeight:900 }}>
                {lastGesture.meta?.text || 'GESTURE'} {lastGesture.meta?.emoji}
              </span>
            </div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>
              Confidence:{' '}
              <span style={{ color:'#fff', fontWeight:800 }}>
                {Math.round((lastGesture.confidence || 0.94) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
