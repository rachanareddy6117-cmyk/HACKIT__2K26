import React from 'react';

/**
 * EchoSign Logo — Dark Futuristic Variant
 */
export default function Logo({ size = 'medium', className = '' }) {
  const s = {
    small:  { textClass: 'text-base',  iconSize: 24 },
    medium: { textClass: 'text-xl',    iconSize: 30 },
    large:  { textClass: 'text-3xl',   iconSize: 44 },
  }[size] || { textClass: 'text-xl', iconSize: 30 };

  const iconStyle = {
    width:      s.iconSize,
    height:     s.iconSize,
    background: 'linear-gradient(135deg, rgba(0,242,254,0.15), rgba(157,80,187,0.15))',
    border:     '1px solid rgba(0,242,254,0.35)',
    boxShadow:  '0 0 16px rgba(0,242,254,0.25)',
    borderRadius: 10,
    flexShrink: 0,
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      className={`flex items-center gap-2.5 font-black tracking-tight select-none ${s.textClass} ${className}`}
      role="img"
      aria-label="EchoSign"
    >
      {/* Icon box */}
      <div style={iconStyle}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          style={{ width: s.iconSize * 0.62, height: s.iconSize * 0.62 }}
        >
          <path
            d="M7 8.5C7 5.46 9.46 3 12.5 3S18 5.46 18 8.5c0 4.5-5.5 10.5-5.5 10.5S7 13 7 8.5Z"
            stroke="#00F2FE"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12.5" cy="8.5" r="2" fill="#00F2FE" opacity="0.8" />
        </svg>
      </div>

      {/* Word mark */}
      <span>
        <span style={{ color: '#00F2FE' }}>Echo</span>
        <span style={{ color: '#FFFFFF' }}>Sign</span>
      </span>
    </div>
  );
}
