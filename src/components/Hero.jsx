import React from 'react';
import { Eye, Mic, Sparkles, Hand } from 'lucide-react';

/* ── Hand skeleton SVG with exact 21 joint dots and cyan glow ── */
function HandSkeleton() {
  const pts = [
    [100, 175], // 0: wrist
    [72, 155], [52, 132], [36, 108], [24, 88],   // 1-4: thumb
    [76, 108], [68, 72], [62, 45], [58, 22],     // 5-8: index
    [100, 102], [100, 64], [100, 36], [100, 14], // 9-12: middle
    [124, 108], [132, 72], [138, 45], [142, 22], // 13-16: ring
    [148, 122], [160, 94], [168, 72], [174, 52]  // 17-20: pinky
  ];

  const bones = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20],
    [5,9],[9,13],[13,17]
  ];

  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        width: '100%',
        height: '100%',
        filter: 'drop-shadow(0 0 12px #00f2fe)'
      }}
    >
      {bones.map(([i, j], idx) => (
        <line
          key={idx}
          x1={pts[i][0]}
          y1={pts[i][1]}
          x2={pts[j][0]}
          y2={pts[j][1]}
          stroke="#00f2fe"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      ))}
      {pts.map(([x, y], idx) => (
        <circle
          key={idx}
          cx={x}
          cy={y}
          r={idx % 4 === 0 || idx === 0 ? 5 : 3.5}
          fill="#00f2fe"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

const FEATURES = [
  { icon: Eye, label: 'Eye', color: '#00f2fe' },
  { icon: Mic, label: 'Mic', color: '#9d50bb' },
  { icon: Sparkles, label: 'Sparkles', color: '#f59e0b' },
  { icon: Hand, label: 'Hands', color: '#ec4899' },
];

export default function Hero({ onGetStarted, onSeeHowItWorks }) {
  return (
    <section style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#07090e',
      padding: '40px 32px 60px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '-120px',
        width: 480,
        height: 480,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,242,254,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-80px',
        width: 440,
        height: 440,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(157,80,187,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Cyber dotted grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.35,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* ── Main Hero Row (Image 1 Layout) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 48,
        alignItems: 'center',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        flex: 1
      }}>
        {/* Left Side: Headline & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{
            fontSize: 'clamp(38px, 5.5vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: 0
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #00f2fe 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Different Languages.
            </span>
            <br />
            <span style={{ color: '#ffffff' }}>One Conversation.</span>
          </h1>

          <p style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: '#8a99ad',
            maxWidth: 460,
            margin: 0
          }}>
            The next-generation sign AI help to corporate conversation, seamless communication across gestures, text, and voice.
          </p>

          {/* Action Buttons (Image 1) */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
            <button
              onClick={onGetStarted}
              style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #9d4edd 100%)',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                padding: '14px 34px',
                borderRadius: 24,
                fontSize: 15,
                fontWeight: 800,
                boxShadow: '0 0 30px rgba(0,242,254,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 44px rgba(0,242,254,0.65)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0,242,254,0.4)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              Get Started
            </button>

            <button
              onClick={onSeeHowItWorks}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '14px 32px',
                borderRadius: 24,
                fontSize: 15,
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              See How It Works
            </button>
          </div>
        </div>

        {/* Right Side: Live Hand Landmark Card (Exact Image 1) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 24,
            background: 'rgba(18, 22, 33, 0.85)',
            border: '1px solid #00f2fe',
            boxShadow: '0 0 50px rgba(0, 242, 254, 0.28), inset 0 0 20px rgba(0, 242, 254, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            aspectRatio: '4/3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Top-Left: LIVE badge */}
            <div style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid #00f2fe',
              color: '#00f2fe',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 10
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00f2fe',
                boxShadow: '0 0 8px #00f2fe',
                display: 'inline-block'
              }} />
              <span>LIVE</span>
            </div>

            {/* Center Hand Silhouette with Cyan Skeleton Mesh */}
            <div style={{
              width: '75%',
              height: '75%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HandSkeleton />
            </div>

            {/* Bottom-Center: Detected Sign pill */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(18, 22, 33, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 20,
              padding: '6px 18px',
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>
                HELLO 👋
              </span>
              <span style={{ color: '#8a99ad', fontSize: 12 }}>
                - Detected Sign
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom 4 Feature Cards (Exact Image 1) ── */}
      <div style={{
        maxWidth: 1200,
        margin: '32px auto 0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        position: 'relative',
        zIndex: 1
      }}>
        {FEATURES.map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            style={{
              background: 'rgba(18, 22, 33, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 18,
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              backdropFilter: 'blur(16px)',
              transition: 'all 0.25s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = `1px solid ${color}60`;
              e.currentTarget.style.boxShadow = `0 0 28px ${color}20`;
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `${color}18`,
              border: `1px solid ${color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${color}25`
            }}>
              <Icon size={24} color={color} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#ffffff' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

