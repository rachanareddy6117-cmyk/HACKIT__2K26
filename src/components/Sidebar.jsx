import React from 'react';
import { MessageSquare, Hand, Languages, ShieldAlert } from 'lucide-react';

const NAV = [
  { id:'conversation', label:'Conversation', icon: MessageSquare },
  { id:'practice',     label:'Practice',     icon: Hand },
  { id:'translate',    label:'Translate',    icon: Languages },
  { id:'emergency',    label:'Emergency',    icon: ShieldAlert, danger: true },
];

export default function Sidebar({ active, onChange }) {
  return (
    <aside style={{
      width: 200, flexShrink: 0,
      background:'rgba(255,255,255,0.03)',
      border:'1px solid rgba(255,255,255,0.06)',
      borderRadius:20, padding:'12px 10px',
      display:'flex', flexDirection:'column', gap:4,
    }}>
      {NAV.map(({ id, label, icon:Icon, danger }) => {
        const isActive = active === id;
        const col = danger ? '#ef4444' : '#00e5ff';
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'10px 14px', borderRadius:12,
            border: isActive ? `1px solid ${col}35` : '1px solid transparent',
            background: isActive
              ? (danger ? 'rgba(239,68,68,0.1)' : 'rgba(0,229,255,0.09)')
              : 'transparent',
            color: isActive ? col : '#94a3b8',
            cursor:'pointer', fontWeight:700, fontSize:13,
            textAlign:'left', width:'100%',
            boxShadow: isActive && !danger ? '0 0 14px rgba(0,229,255,0.08)' : 'none',
            transition:'all .2s',
          }}
          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#fff'; }}}
          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8'; }}}
          >
            <Icon size={16}/>
            {label}
          </button>
        );
      })}
    </aside>
  );
}
