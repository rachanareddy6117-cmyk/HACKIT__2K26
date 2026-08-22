import React from 'react';

/** Reusable glassmorphism card */
export default function GlassCard({ children, className = '', style = {}, cyan = false, onClick }) {
  const base = {
    background:          cyan ? 'rgba(0,229,255,0.05)' : 'rgba(255,255,255,0.04)',
    border:              `1px solid ${cyan ? 'rgba(0,229,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
    backdropFilter:      'blur(20px)',
    WebkitBackdropFilter:'blur(20px)',
    borderRadius:        22,
    ...style,
  };
  return (
    <div className={className} style={base} onClick={onClick}>
      {children}
    </div>
  );
}
