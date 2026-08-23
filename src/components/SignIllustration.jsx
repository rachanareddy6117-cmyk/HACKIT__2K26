import React from 'react';
import { Hand } from 'lucide-react';

const SIGN_LABELS = {
  OPEN_HAND: 'Open hand',
  FIST: 'Fist',
  THUMBS_UP: 'Thumbs up',
  PEACE: 'Peace',
  POINT: 'Point',
  OK: 'OK',
};

export default function SignIllustration({ sign = 'OPEN_HAND', emoji, size = 64 }) {
  const label = SIGN_LABELS[sign] || sign.replaceAll('_', ' ').toLowerCase();
  const iconSize = Math.max(18, Math.round(size * 0.62));

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: '#E2E8F0',
      }}
    >
      {emoji ? (
        <span aria-hidden="true" style={{ fontSize: size * 0.62, lineHeight: 1 }}>
          {emoji}
        </span>
      ) : (
        <Hand aria-hidden="true" size={iconSize} strokeWidth={1.7} />
      )}
    </span>
  );
}
