import React, { useState } from 'react';
import { ShieldAlert, Volume2, Radio } from 'lucide-react';
import { broadcastEmergencyApi } from '../services/api';

const ACTIONS = [
  { id:'help',     label:'🆘 I NEED HELP',    speech:'I need immediate help!',                  color:'#ef4444' },
  { id:'doctor',   label:'🏥 I NEED A DOCTOR', speech:'I need medical assistance from a doctor.', color:'#f97316' },
  { id:'water',    label:'💧 I NEED WATER',    speech:'Please I need drinking water.',             color:'#00e5ff' },
  { id:'security', label:'🚨 CALL SECURITY',   speech:'Call security officers right away.',        color:'#f59e0b' },
  { id:'lost',     label:'📍 I AM LOST',        speech:'I am lost and need directions.',           color:'#9d50bb' },
  { id:'pain',     label:'❤️ I AM IN PAIN',     speech:'I am experiencing serious pain.',          color:'#ef4444' },
];

export default function EmergencyModule() {
  const [active, setActive] = useState(null);

  const trigger = (a) => {
    setActive(a);
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(a.speech));
    broadcastEmergencyApi({
      alertId: a.id,
      label: a.label,
      speech: a.speech,
      location: 'User Geolocation Coordinates: Active'
    }).catch(() => {});
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18, height:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:800, color:'#F87171', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>
            RIGHT THIRD • Emergency Module
          </div>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#fff' }}>Accessible Emergency Alerts</h2>
        </div>
        <div style={{
          width:38, height:38, borderRadius:12,
          background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <ShieldAlert size={18} color="#ef4444"/>
        </div>
      </div>

      {/* Action grid */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, flex:1,
      }}>
        {ACTIONS.map(a => (
          <button key={a.id} onClick={() => trigger(a)} style={{
            background:`${a.color}12`,
            border:`1px solid ${a.color}40`,
            borderRadius:14, padding:'18px 12px',
            color:'#fff', cursor:'pointer', fontWeight:700,
            fontSize:13, textAlign:'center',
            transition:'all .2s',
            backdropFilter:'blur(10px)',
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.background=`${a.color}22`;
            e.currentTarget.style.boxShadow=`0 0 28px ${a.color}30`;
            e.currentTarget.style.transform='translateY(-2px)';
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.background=`${a.color}12`;
            e.currentTarget.style.boxShadow='none';
            e.currentTarget.style.transform='none';
          }}
          >{a.label}</button>
        ))}
      </div>

      {/* Broadcast Alert banner */}
      {active ? (
        <div style={{
          padding:'14px 18px', borderRadius:14,
          background:'rgba(239,68,68,0.08)',
          border:'1px solid rgba(239,68,68,0.3)',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <Volume2 size={18} color="#ef4444" className="anim-blink"/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:800, color:'#ef4444', marginBottom:2 }}>Broadcasting Alert</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>"{active.speech}"</div>
          </div>
          <button onClick={() => { setActive(null); window.speechSynthesis?.cancel(); }} style={{
            background:'rgba(255,255,255,0.06)',
            border:'1px solid rgba(255,255,255,0.1)',
            color:'#94a3b8', cursor:'pointer',
            padding:'4px 10px', borderRadius:8, fontSize:10, fontWeight:700,
          }}>Dismiss</button>
        </div>
      ) : (
        <div style={{
          padding:'14px 18px', borderRadius:14, textAlign:'center',
          background:'rgba(239,68,68,0.05)',
          border:'1px solid rgba(239,68,68,0.15)',
          fontSize:12, fontWeight:700, color:'#ef4444', cursor:'default',
        }}>Broadcast Alert</div>
      )}
    </div>
  );
}
