import React from 'react';
import GestureSkeletonThumbnail from './GestureSkeletonThumbnail';

export default function SignIllustration({ sign = 'OPEN_HAND', emoji, size = 64, showSkeleton = true }) {
  const normalizedSign = (sign || 'OPEN_HAND').toUpperCase();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {/* 2D Line and Dot Skeleton Diagram */}
      {showSkeleton && (
        <GestureSkeletonThumbnail sign={normalizedSign} size={size} />
      )}

      {/* Emoji / Glyph */}
      {emoji && (
        <span
          role="img"
          aria-label={sign}
          style={{
            fontSize: Math.round(size * 0.6),
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {emoji}
        </span>
      )}
    </div>
  );
}
