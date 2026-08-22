import React from 'react';
import { Eye, Mic, Sparkles, Hand } from 'lucide-react';

/* ── Hand skeleton SVG — matches the reference screenshot ── */
function HandSkeleton() {
  const pts = [[50,88],[50,70],[36,50],[30,28],[50,70],[46,36],[46,14],[50,70],[56,36],[58,16],[50,70],[66,42],[72,26],[50,70],[74,52],[82,40]];
  const conns = [[0,1],[1,2],[2,3],[1,4],[4,5],[5,6],[1,7],[7,8],[8,9],[1,10],[10,11],[11,12],[1,13],[13,14],[14,15]];
  return (
    <svg viewBox="0 0 110 110" fill="none"
      style={{ width:'100%', height:'100%', filter:'drop-shadow(0 0 14px rgba(0,229,255,.7))' }}>
      {conns.map(([i,j],k)=>(
        <line key={k} x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]}
          stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      {pts.map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i===0?5:3.5}
          fill={i===0?"#9d50bb":"#00e5ff"} stroke="#fff" strokeWidth="1.2"/>
      ))}
    </svg>
  );
}

const FEATURES = [
  { icon: Eye,      label:'Eye',      color:'#00e5ff' },
  { icon: Mic,      label:'Mic',      color:'#9d50bb' },
  { icon: Sparkles, label:'Sparkles', color:'#f59e0b' },
  { icon: Hand,     label:'Hands',    color:'#ec4899' },
];

export default function Hero({ onGetStarted, onSeeHowItWorks }) {
  const [activeSignIdx, setActiveSignIdx] = React.useState(0);
  const DEMO_SIGNS = [
    { title: 'HELLO 👋', label: '— Detected Sign' },
    { title: 'I LOVE YOU 🤟', label: '— ASL Expression' },
    { title: 'THUMBS UP 👍', label: '— Affirmative' },
    { title: 'PEACE ✌️', label: '— Victory / Two' },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSignIdx(i => (i + 1) % DEMO_SIGNS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const currentSign = DEMO_SIGNS[activeSignIdx];

  return (
    <section className="landing-hero" style={{
      minHeight:'calc(100vh - 64px)',
      background:'linear-gradient(180deg,#05070a 0%,#0b0e14 100%)',
      padding:'60px 32px 80px',
      display:'flex', flexDirection:'column', gap:64,
      position:'relative', overflow:'hidden',
    }}>
      {/* BG glow blobs */}
      <div style={{
        position:'absolute', top:'-160px', left:'-160px',
        width:520, height:520, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(0,229,255,0.07) 0%,transparent 70%)',
        pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', bottom:'-120px', right:'-80px',
        width:440, height:440, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(157,80,187,0.09) 0%,transparent 70%)',
        pointerEvents:'none',
      }}/>
      {/* Cyber grid */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', opacity:.6,
        backgroundImage:'linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)',
        backgroundSize:'44px 44px',
      }}/>

      {/* ── Hero row ── */}
      <div className="landing-hero-row" style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:48,
        alignItems:'center',
        maxWidth:1200,
        margin:'0 auto',
        width:'100%',
        position:'relative', zIndex:1,
      }}>
        {/* LEFT */}
        <div className="anim-fadeup landing-hero-copy" style={{ display:'flex', flexDirection:'column', gap:28 }}>
          <h1 style={{
            fontSize:'clamp(36px,5vw,64px)', fontWeight:900,
            lineHeight:1.05, letterSpacing:'-0.04em',
          }}>
            <span className="grad-text">Different Languages.</span>
            <br/>
            <span style={{ color:'#fff' }}>One Conversation.</span>
          </h1>

          <p style={{ fontSize:15, lineHeight:1.7, color:'#94a3b8', maxWidth:480 }}>
            Real-time sign language AI and multi-modal accessibility bridge connecting speech, text, and gestures seamlessly.
          </p>

          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <button onClick={onGetStarted} style={{
              background:'linear-gradient(135deg,#00e5ff,#9d50bb)',
              color:'#fff', border:'none', cursor:'pointer',
              padding:'13px 30px', borderRadius:14,
              fontSize:15, fontWeight:700,
              boxShadow:'0 0 30px rgba(0,229,255,0.35)',
              transition:'all .2s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 0 44px rgba(0,229,255,0.55)';e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 0 30px rgba(0,229,255,0.35)';e.currentTarget.style.transform='none';}}
            >Get Started</button>

            <button
              onClick={onSeeHowItWorks}
              style={{
                background:'rgba(255,255,255,0.05)',
                color:'#fff', cursor:'pointer',
                padding:'13px 30px', borderRadius:14,
                fontSize:15, fontWeight:600,
                border:'1px solid rgba(255,255,255,0.12)',
                backdropFilter:'blur(12px)',
                transition:'all .2s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
            >
              See How It Works
            </button>
          </div>
        </div>

        {/* RIGHT — Camera preview card (matches screenshot 1) */}
        <div className="anim-fadeup delay-2" style={{ display:'flex', justifyContent:'center' }}>
          <div style={{
            width:'100%', maxWidth:420,
            borderRadius:24,
            background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(0,229,255,0.2)',
            boxShadow:'0 0 60px rgba(0,229,255,0.12), 0 0 120px rgba(157,80,187,0.08)',
            overflow:'hidden',
          }}>
            {/* Status bar */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 16px',
              borderBottom:'1px solid rgba(255,255,255,0.06)',
              fontSize:11, fontWeight:700,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:'#00e5ff' }}>
                <span className="anim-blink" style={{
                  width:8, height:8, borderRadius:'50%',
                  background:'#00e5ff', boxShadow:'0 0 8px #00e5ff', display:'inline-block',
                }}/>
                LIVE
              </div>
              <span style={{ color:'#475569', fontFamily:'monospace', fontSize:10 }}>MediaPipe Vision</span>
            </div>

            {/* Camera area */}
            <div style={{
              aspectRatio:'4/3', background:'#05070a', position:'relative',
              display:'flex', alignItems:'center', justifyContent:'center',
              overflow:'hidden',
            }}>
              <div style={{
                width:'60%', height:'60%',
                position:'relative', zIndex:2,
              }}>
                <HandSkeleton/>
              </div>

              {/* AR caption */}
              <div style={{
                position:'absolute', bottom:14, left:'50%',
                transform:'translateX(-50%)',
                background:'rgba(0,0,0,0.8)',
                border:'1px solid rgba(0,229,255,0.4)',
                borderRadius:14, padding:'8px 20px',
                backdropFilter:'blur(12px)',
                textAlign:'center', whiteSpace:'nowrap', zIndex:3,
              }}>
                <span style={{ color:'#00e5ff', fontWeight:800, fontSize:15 }}>{currentSign.title}</span>
                <span style={{ color:'#94a3b8', fontSize:11, marginLeft:8 }}>{currentSign.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature Cards (matches screenshot 1 bottom row) ── */}
      <div className="landing-feature-grid" style={{
        maxWidth:1200, margin:'0 auto', width:'100%',
        display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16,
        position:'relative', zIndex:1,
      }}>
        {FEATURES.map(({ icon:Icon, label, color }, i) => (
          <div key={label}
            className={`anim-fadeup delay-${i+1}`}
            style={{
              background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:18, padding:'22px 20px',
              display:'flex', flexDirection:'column', gap:14,
              cursor:'default', transition:'all .25s',
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.border=`1px solid ${color}44`;
              e.currentTarget.style.boxShadow=`0 0 28px ${color}18`;
              e.currentTarget.style.transform='translateY(-3px)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.border='1px solid rgba(255,255,255,0.07)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.transform='none';
            }}
          >
            <div style={{
              width:46, height:46, borderRadius:14,
              background:`${color}18`,
              border:`1px solid ${color}35`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Icon size={22} color={color}/>
            </div>
            <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
