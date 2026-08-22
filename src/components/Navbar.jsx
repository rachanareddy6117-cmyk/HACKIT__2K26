import React from 'react';

export default function Navbar({ onGetStarted, onLogin }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(5,7,10,0.88)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:32, height:32, borderRadius:10,
          background:'linear-gradient(135deg,rgba(0,229,255,0.25),rgba(157,80,187,0.25))',
          border:'1px solid rgba(0,229,255,0.4)',
          boxShadow:'0 0 14px rgba(0,229,255,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg viewBox="0 0 20 20" fill="none" style={{width:18,height:18}}>
            <path d="M10 2C7.24 2 5 4.24 5 7c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5z"
              stroke="#00e5ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="7" r="2" fill="#00e5ff"/>
          </svg>
        </div>
        <span style={{ fontWeight:800, fontSize:18, letterSpacing:'-0.03em' }}>
          <span style={{ color:'#00e5ff' }}>Echo</span>
          <span style={{ color:'#fff' }}>Sign</span>
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display:'flex', gap:32, alignItems:'center' }}>
        {['Overview','About','Template','Pricing','Patterns'].map(l => (
          <a key={l} href="#" style={{
            color:'#94a3b8', fontSize:13, fontWeight:500,
            textDecoration:'none', transition:'color .2s',
          }}
          onMouseEnter={e=>e.currentTarget.style.color='#fff'}
          onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}
          >{l}</a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onLogin} style={{
          background:'rgba(255,255,255,0.04)',
          color:'#fff', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer',
          padding:'8px 16px', borderRadius:12,
          fontSize:13, fontWeight:700,
        }}>
          Login
        </button>
        <button onClick={onGetStarted} style={{
          background:'linear-gradient(135deg,#00e5ff,#9d50bb)',
          color:'#fff', border:'none', cursor:'pointer',
          padding:'8px 22px', borderRadius:12,
          fontSize:13, fontWeight:700,
          boxShadow:'0 0 20px rgba(0,229,255,0.3)',
          transition:'all .2s',
        }}>
          Sign Up
        </button>
      </div>
    </nav>
  );
}
